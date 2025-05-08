from pathlib import Path
import statistics
import rdata
from scipy.interpolate import RegularGridInterpolator
import re
import time
from datetime import datetime, timezone, timedelta
import os
import logging
from typing import Optional, List, Tuple
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import xarray as xr
import numpy as np
import pandas as pd
import cfgrib
import warnings
import requests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("solar-forecast")

# Ignore FutureWarnings (including those from xgboost's pandas usage)
warnings.filterwarnings("ignore", category=FutureWarning)

# CAMS API credentials
# These should ideally be set as environment variables in production
CAMS_USER = os.environ.get("CAMS_USER")
CAMS_PASSWORD = os.environ.get("CAMS_PASSWORD") 

# Set the notification URL and token
NOTIFICATION_URL = os.environ.get("NOTIFICATION_URL", "https://hyrefapp.dev.desp.space/api/Jobs/jobresult")
NOTIFICATION_TOKEN = os.environ.get("NOTIFICATION_TOKEN", "916ab7c8-acb39e299883-f1ca-419b-816b-7cfb307e6daf883b-aa91b02090b8")

app = FastAPI(title="Solar Forecast API")

class ForecastRequest(BaseModel):
    longitude: float
    latitude: float
    altitude: float
    trained_model_path: str
    jobKey: str
    grib_file_path: Optional[str] = None  # Optional path to specific GRIB file

class ForecastResponse(BaseModel):
    jobKey: str
    status: str
    type: str = "forecast"
    source: str = "solar"
    error: Optional[str] = None
    datetime: str

class FileInfo(BaseModel):
    path: str
    friendlyname: str
    size: int

class NotificationPayload(BaseModel):
    jobKey: str
    status: str
    error: Optional[str] = None
    datetime: str
    payload: Optional[dict] = None
    files: Optional[List[FileInfo]] = []

# Import required libraries if available
try:
    import pvlib
    from xgboost import XGBRegressor
    PVLIB_AVAILABLE = True
    XGBOOST_AVAILABLE = True
except ImportError:
    logger.warning("pvlib or xgboost not available - solar prediction functionality limited")
    PVLIB_AVAILABLE = False
    XGBOOST_AVAILABLE = False

def get_cams_token():
    """Get an access token for the CAMS API"""
    try:
        token_url = 'https://identity.data.destination-earth.eu/auth/realms/dedl/protocol/openid-connect/token'
        response = requests.post(
            token_url,
            data = {
                'grant_type': 'password',
                'scope': 'openid', 
                'client_id': 'hda-public', 
                'username': CAMS_USER, 
                'password': CAMS_PASSWORD
            },
            headers = {"Content-Type": "application/x-www-form-urlencoded"}
        )
        response.raise_for_status()
        access_token = response.json()['access_token']
        return access_token
    except Exception as e:
        logger.error(f"Failed to get CAMS API token: {str(e)}")
        return None
def send_notification(notification_data):
    """Send a notification to the external service"""
    if not NOTIFICATION_URL:
        logger.warning("No notification URL configured - skipping notification")
        return False
    
    try:
        logger.info(f"Sending notification to {NOTIFICATION_URL}")
        response = requests.post(
            NOTIFICATION_URL,
            json=notification_data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {NOTIFICATION_TOKEN}"
            }
        )
        
        if response.status_code >= 400:
            logger.warning(f"Notification failed with status {response.status_code}")
            logger.warning(f"Response: {response.text}")
            return False
        
        logger.info(f"Notification sent successfully to {NOTIFICATION_URL}")
        return True
    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")
        return False


def download_aod_data(latitude: float, longitude: float, date_str: str = None, leadtime_hours: List[int] = None) -> Tuple[bool, str, Optional[str]]:
    """
    Download AOD (Aerosol Optical Depth) data from CAMS for the specified location and date
    
    Args:
        latitude: Target latitude
        longitude: Target longitude
        date_str: Date in format YYYY-MM-DD (defaults to current date)
        leadtime_hours: List of specific lead time hours to request (defaults to 24-72h)
        
    Returns:
        Tuple of (success, error_message, downloaded_file_path)
    """
    try:
        # Use current date if not specified
        if not date_str:
            date_str = datetime.now().strftime("%Y-%m-%d")
        
        # Use default lead time hours if not specified
        if not leadtime_hours:
            leadtime_hours = list(range(0, 48))  # Default 0 to 48 hours
            
        logger.info(f"Downloading AOD data for lat: {latitude}, lon: {longitude}, date: {date_str}, lead times: {min(leadtime_hours)}-{max(leadtime_hours)}h")
        
        # Get authentication token
        access_token = get_cams_token()
        if not access_token:
            return False, "Failed to authenticate with CAMS API", None
        
        auth_headers = {'Authorization': f'Bearer {access_token}'}
        
        # Define the bounding box (small area around the target location)
        # Add a small buffer around the target point (0.2 degrees)
        min_lon = longitude - 0.2
        min_lat = latitude - 0.2
        max_lon = longitude + 0.2
        max_lat = latitude + 0.2
        bbox = [min_lon, min_lat, max_lon, max_lat]
        
        # Format date for the search query
        date_time_str = f"{date_str}T00:00:00Z/{date_str}T23:59:59Z"
        
        # Convert lead time hours to strings for the API
        leadtime_str = [str(h) for h in leadtime_hours]
        
        # Search for available data
        response = requests.post("https://hda.data.destination-earth.eu/stac/search", 
            headers=auth_headers, 
            json={
                "collections": ["EO.ECMWF.DAT.CAMS_GLOBAL_ATMOSHERIC_COMPO_FORECAST"],
                "datetime": date_time_str,
                'bbox': bbox,  
                "query": {
                    "type": {
                        "eq": "forecast"
                    },
                    "variable": {
                        "eq": "total_aerosol_optical_depth_550nm"
                    },
                    "time": {
                        "eq": "00:00"
                    },
                    "leadtime_hour": {
                        "eq": leadtime_str
                    },
                    "format": {
                        "eq": "grib"
                    }
                }
            }
        )
        
        if response.status_code != 200 or "features" not in response.json() or len(response.json()["features"]) == 0:
            logger.error(f"Failed to find AOD data: {response.text}")
            return False, f"No AOD data available for the specified parameters", None
        
        # Get the first product found
        product = response.json()["features"][0]
        
        # Get download URL
        download_url = product["assets"]["downloadLink"]["href"]
        HTTP_SUCCESS_CODE = 200
        
        # Start download
        response = requests.get(download_url, headers=auth_headers)
        
        if response.status_code == HTTP_SUCCESS_CODE:
            # Download is immediately available
            pass
        else:
            # Need to poll until data is ready
            max_retries = 10
            retries = 0
            while url := response.headers.get("Location"):
                logger.info(f"AOD data order status: {response.json().get('status', 'unknown')}")
                time.sleep(5)  # Wait 5 seconds between retries
                response = requests.get(url, headers=auth_headers, stream=True)
                response.raise_for_status()
                retries += 1
                if retries >= max_retries:
                    return False, "Timeout waiting for AOD data to be ready", None
        
        # Extract filename from content disposition header
        if "Content-Disposition" not in response.headers:
            return False, "No Content-Disposition header in response", None
            
        filename = re.findall('filename=\\"?(.+)\\"?', response.headers["Content-Disposition"])[0]
        
        # Make the filename more informative
        output_file = f"./data/AOD_{date_str}_{filename}"
        
        # Save the file
        with open(output_file, 'wb') as f:
            for data in response.iter_content(1024):
                f.write(data)
                
        logger.info(f"Downloaded AOD data to {output_file}")
        return True, None, output_file
        
    except Exception as e:
        error_msg = f"Error downloading AOD data: {str(e)}"
        logger.error(error_msg)
        return False, error_msg, None

def apply_aod_correction(df_post_processed: pd.DataFrame, aod_file_path: str, 
                         latitude: float, longitude: float) -> Tuple[bool, str, pd.DataFrame]:
    """
    Apply AOD correction to the post-processed data using the downloaded AOD data and lookup table
    
    Args:
        df_post_processed: Post-processed GRIB data
        aod_file_path: Path to the downloaded AOD GRIB file
        latitude: Target latitude
        longitude: Target longitude
        
    Returns:
        Tuple of (success, error_message, corrected_dataframe)
    """
    try:
        logger.info(f"Applying AOD correction using {aod_file_path}")
        
        # Load the AOD data
        ds = xr.open_dataset(aod_file_path, engine="cfgrib")
        
        # Extract AOD values using median of 4 closest points to target location
        a = []
        try:
            # Find the grid points closest to the target location
            # This approach assumes the AOD data is on a regular grid
            for i in range(ds.aod550.values.shape[0]):
                # Extract the 4 closest grid points
                list_values = [ds.aod550.values[i][0][0], ds.aod550.values[i][0][1], 
                              ds.aod550.values[i][1][0], ds.aod550.values[i][1][1]]
                # Use median for robustness
                mdn = statistics.median(list_values)
                a.append(mdn)
                
            logger.info(f"Extracted {len(a)} AOD values from {aod_file_path}")
        except Exception as e:
            logger.error(f"Error extracting AOD values using primary method: {str(e)}")
            logger.info("Trying alternative AOD extraction method...")
            
            # Fallback method if the first approach fails
            try:
                # Extract latitude and longitude arrays
                latitudes = ds["latitude"].values
                longitudes = ds["longitude"].values
                
                # Calculate the distance to each lat/lon point
                distances = np.sqrt((latitudes - latitude) ** 2 + (longitudes - longitude) ** 2)
                
                # Find the index of the minimum distance
                closest_idx = distances.argmin()
                
                # Extract the AOD values at the closest point
                aod_var_name = "aod550" if "aod550" in ds.data_vars else "total_aerosol_optical_depth_550nm"
                aod_values = ds[aod_var_name].isel(values=closest_idx)
                
                # Extract values for all timesteps
                for i in range(len(aod_values.step)):
                    a.append(float(aod_values.isel(step=i).values))
                
                logger.info(f"Extracted {len(a)} AOD values using alternative method")
            except Exception as inner_e:
                error_msg = f"Error extracting AOD values using alternative method: {str(inner_e)}"
                logger.error(error_msg)
                return False, error_msg, df_post_processed
        
        # Create timestamps by adding the nanoseconds to the initial timestamp
        timestamps = [ds.time.values + pd.to_timedelta(ns, unit='ns') for ns in ds.step.values]
        
        # Convert list to DatetimeIndex for further use
        timestamps_index = pd.DatetimeIndex(timestamps)
        
        # Calculate solar position for each timestamp
        solar_positions = pvlib.solarposition.get_solarposition(timestamps_index, latitude, longitude)
        
        # Extract the Solar Zenith Angle (SZA)
        sza = solar_positions['apparent_zenith'].values
        
        # Load lookup table
        lookup_table_path = os.environ.get("AOD_LOOKUP_TABLE_PATH", "./aod_variables/eglo_surf_lut_cs_high_res_NAcorrected_alb02.Rdata")
        
        # Check if lookup table exists
        if not os.path.exists(lookup_table_path):
            logger.warning(f"AOD lookup table not found at {lookup_table_path}. Using simple Beer's law correction instead.")
            # Fallback to simple correction using Beer's law
            transmission = np.exp(-np.array(a))
            
            # Apply the correction to the radiation value
            df_corrected = df_post_processed.copy()
            if 'var' in df_corrected.columns:
                df_corrected['var'] = df_post_processed['var'].values * transmission
            else:
                # If the column name is different, apply to the first column
                df_corrected.iloc[:, 0] = df_post_processed.iloc[:, 0].values * transmission
                
            logger.info(f"Applied simple Beer's law AOD correction")
            return True, None, df_corrected
        
        # Load and parse the R data file
        try:
            parsed = rdata.parser.parse_file(lookup_table_path)
            converted = rdata.conversion.convert(parsed)
            
            # Extract the coordinates (the lookup grid)
            sza_vals = converted['eglo'].coords['sza'].values.astype(float)
            aot_vals = converted['eglo'].coords['aot'].values.astype(float)
            ssa_vals = converted['eglo'].coords['ssa'].values.astype(float)
            toc_vals = converted['eglo'].coords['toc'].values.astype(float)
            wv_vals = converted['eglo'].coords['wv'].values.astype(float)
            ae_vals = converted['eglo'].coords['ae'].values.astype(float)
            
            # The array data
            eglo_values = converted['eglo'].values
            
            # Create an interpolator for the multidimensional grid
            interpolator = RegularGridInterpolator(
                (sza_vals, aot_vals, ssa_vals, toc_vals, wv_vals, ae_vals),  # Grid coordinates
                eglo_values,  # Data array to interpolate
                bounds_error=False,  # Set to False to allow extrapolation
                fill_value=None  # None means it will extrapolate outside bounds
            )
            
            # Get current month for climate parameters
            current_month = datetime.now().month
            
            # Define default climate parameters by month if station data isn't available
            # These are fallback values if the CSV isn't found
            default_toc = 300  # Total Ozone Column in Dobson Units
            default_ssa = 0.95  # Single Scattering Albedo
            default_wv = 2.0    # Water Vapor in cm
            default_ae = 1.3    # Angstrom Exponent
            
            # Try to load station climate data
            station_data_path = os.environ.get("STATION_CLIMATE_PATH", "./aod_variables/station_clima.csv")
            
            if os.path.exists(station_data_path):
                try:
                    station = pd.read_csv(station_data_path)
                    toc = float(station.toc_omi[current_month-1])
                    ssa = float(station.ssa550[current_month-1])
                    wv = float(station.tcwv_cams[current_month-1])/10  # Convert to proper units
                    ae = float(station.ae_470_850[current_month-1])
                    logger.info(f"Loaded station climate data for month {current_month}: TOC={toc}, SSA={ssa}, WV={wv}, AE={ae}")
                except Exception as e:
                    logger.warning(f"Error loading station climate data: {str(e)}. Using default values.")
                    toc = default_toc
                    ssa = default_ssa
                    wv = default_wv
                    ae = default_ae
            else:
                logger.warning(f"Station climate data not found at {station_data_path}. Using default values.")
                toc = default_toc
                ssa = default_ssa
                wv = default_wv
                ae = default_ae
            
            # Prepare interpolation points for each SZA and AOT value
            # Make sure arrays are the same length
            min_len = min(len(sza), len(a))
            if min_len < len(sza) or min_len < len(a):
                logger.warning(f"Length mismatch: SZA={len(sza)}, AOD={len(a)}. Using first {min_len} values.")
                sza = sza[:min_len]
                a = a[:min_len]
                
            interpolation_points_original = np.array([[s, aot, ssa, toc, wv, ae] for s, aot in zip(sza, a)])
            
            # Interpolate values with the original AOT
            interpolated_values_original = interpolator(interpolation_points_original)
            
            # Prepare interpolation points with AOT = 0 for each SZA
            interpolation_points_aot_0 = np.array([[s, 0, ssa, toc, wv, ae] for s in sza])
            
            # Interpolate values with AOT = 0
            interpolated_values_aot_0 = interpolator(interpolation_points_aot_0)
            
            # Convert interpolated values to 0 where SZA is greater than 90
            interpolated_values_original[sza > 90] = 0
            interpolated_values_aot_0[sza > 90] = 0
            
            # Calculate the ratio
            # Avoid division by zero by masking where `interpolated_values_aot_0` is 0
            logger.info(f"Interpolated values (original AOT): {interpolated_values_original}")
            logger.info(f"Interpolated values (AOT=0): {interpolated_values_aot_0}")
            ratio = np.where(np.abs(interpolated_values_aot_0) > 1e-10, 
                            interpolated_values_original / interpolated_values_aot_0, 
                            1.0)  # Use 1.0 (no correction) where division is undefined
            logger.info(f"Ratio: {ratio}")
            # Get GHI from the post-processed dataframe
            if 'var' in df_post_processed.columns:
                ghi = df_post_processed['var'].values
            else:
                ghi = df_post_processed.iloc[:, 0].values
                
            # Make sure arrays are the same length for the correction
            if len(ratio) < len(ghi):
                logger.warning(f"Correction ratio length ({len(ratio)}) less than GHI data length ({len(ghi)}). Padding ratio.")
                # Pad with 1.0 (no correction) if needed
                ratio = np.pad(ratio, (0, len(ghi) - len(ratio)), 'constant', constant_values=1.0)
            elif len(ratio) > len(ghi):
                logger.warning(f"Correction ratio length ({len(ratio)}) greater than GHI data length ({len(ghi)}). Truncating ratio.")
                ratio = ratio[:len(ghi)]
                
            # Apply the correction
            ghi_corrected = ratio * ghi
            
            # Replace NaN with original values
            ghi_corrected = np.nan_to_num(ghi_corrected, nan=ghi)
            
            # Create the corrected dataframe
            df_corrected = df_post_processed.copy()
            if 'var' in df_corrected.columns:
                df_corrected['var'] = ghi_corrected
            else:
                df_corrected.iloc[:, 0] = ghi_corrected
                
            logger.info(f"Applied LUT-based AOD correction with correction factors ranging from {np.min(ratio)} to {np.max(ratio)}")
            return True, None, df_corrected
            
        except Exception as e:
            logger.error(f"Error applying LUT-based AOD correction: {str(e)}")
            logger.info("Falling back to simpler Beer's law correction")
            
            # Fallback to simple correction using Beer's law
            transmission = np.exp(-np.array(a))
            
            # Make sure arrays are the same length for the correction
            if len(transmission) < len(df_post_processed):
                # Pad with 1.0 (no correction) if needed
                transmission = np.pad(transmission, (0, len(df_post_processed) - len(transmission)), 'constant', constant_values=1.0)
            elif len(transmission) > len(df_post_processed):
                transmission = transmission[:len(df_post_processed)]
                
            # Apply the correction to the radiation value
            df_corrected = df_post_processed.copy()
            if 'var' in df_corrected.columns:
                df_corrected['var'] = df_post_processed['var'].values * transmission
            else:
                # If the column name is different, apply to the first column
                df_corrected.iloc[:, 0] = df_post_processed.iloc[:, 0].values * transmission
                
            logger.info(f"Applied simple Beer's law AOD correction with transmission factors ranging from {np.min(transmission)} to {np.max(transmission)}")
            return True, None, df_corrected
            
    except Exception as e:
        error_msg = f"Error applying AOD correction: {str(e)}"
        logger.error(error_msg)
        return False, error_msg, df_post_processed

def process_grib_file(grib_path, target_lat, target_lon):
    """
    Process the GRIB file according to the specified methodology.
    
    Args:
        grib_path (str): Path to the GRIB file
        target_lat (float): Target latitude
        target_lon (float): Target longitude
        
    Returns:
        tuple: (success, error_message, processed_data, dataset)
    """
    try:
        logger.info(f"Processing GRIB file: {grib_path}")
        
        # Ensure the GRIB file exists
        if not Path(grib_path).exists():
            return False, f"GRIB file does not exist: {grib_path}", None, None
        print(f"GRIB file exists: {grib_path}")
        
        # Open GRIB datasets
        datasets = cfgrib.open_datasets(grib_path)
        
        # Use the first dataset if multiple are returned
        ds = datasets[0] if isinstance(datasets, list) and len(datasets) > 0 else datasets

        logger.info(f"GRIB file dimensions: {ds.dims}") 
        
        # Check specifically for timesteps
        if 'step' in ds.dims:
            num_timesteps = ds.dims['step']
            logger.info(f"Number of timesteps in GRIB file: {num_timesteps}")
            # Log actual step values to debug
            logger.info(f"Step values: {ds.step.values}")
        elif 'time' in ds.dims:
            num_timesteps = ds.dims['time']
            logger.info(f"Number of timesteps (time dimension) in GRIB file: {num_timesteps}")
        
        # Log more detailed information about the dataset
        logger.info(f"GRIB file coordinates: {list(ds.coords)}")
        logger.info(f"GRIB file data variables: {list(ds.data_vars)}")
        
        # Extract latitude and longitude arrays
        latitudes = ds["latitude"].values
        longitudes = ds["longitude"].values
        
        # Calculate the distance to each lat/lon point
        distances = np.sqrt((latitudes - target_lat) ** 2 + (longitudes - target_lon) ** 2)
        
        # Find the index of the minimum distance
        closest_idx = distances.argmin()
        
        # Extract the data at the closest latitude and longitude
        selected_data = ds["ssrd"].isel(values=closest_idx)
        
        print("sel data:step 47: ",selected_data.isel(step=37).values)
        # Get the actual number of steps available
        actual_num_steps = len(selected_data.step) if hasattr(selected_data, 'step') else num_timesteps
        logger.info(f"Actual number of steps in selected data: {actual_num_steps}")
        
        target_data = []
        # Use the actual number of steps instead of hardcoded 48
        step_values = selected_data.step.values
        logger.info(f"Step values: {step_values}")


        for i in range(min(actual_num_steps, 48)):  # Safety check
            try:
                step_data = selected_data.isel(step=i).values
                logger.info(f"Step {i} data: {step_data}")
                target_data.append(step_data)
            except Exception as e:
                logger.error(f"Error accessing step {i}: {str(e)}")
                # If we can't access this step, break the loop
                break
        
        def generate_timestamps(start_timestamp, num_steps):
            timestamps = []
            current_timestamp = start_timestamp
            try:
                for i in range(num_steps):
                    timestamps.append(current_timestamp)
                    current_timestamp += np.timedelta64(1, 'h')
            except Exception as e:
                logger.error(f"Error generating timestamps at step {i}: {str(e)}")
            return timestamps
        
        timedelta = np.timedelta64(1, 'h')
        # Add the timedelta to the date
        start_timestamp = ds.time.values  # + timedelta
        
        # Use the actual number of steps available
        num_steps = len(target_data)
        logger.info(f"Using {num_steps} steps for timestamp generation")
        
        timestamps = pd.DataFrame(generate_timestamps(start_timestamp, num_steps))
        timestamp_file = f'timestamps_{os.path.basename(grib_path)[6:-5]}.csv'
        timestamps.to_csv(timestamp_file)
        logger.info(f"Saved timestamps to {timestamp_file}")
        
        target_df = pd.DataFrame()
        target_df['var'] = pd.to_numeric(target_data, errors='coerce')
        
        # Check timestamps shape to prevent errors
        if len(timestamps) != len(target_data):
            logger.warning(f"Timestamp count ({len(timestamps)}) doesn't match data count ({len(target_data)})")
            # Adjust if needed
            timestamps = timestamps[:len(target_data)]
        
        try:
            timestamps = np.array(timestamps).flatten()
            target_df.set_index(timestamps, inplace=True)
        except Exception as e:
            logger.error(f"Error setting timestamps as index: {str(e)}")
            # Fallback to simple integer index if timestamps don't work
            target_df.reset_index(drop=True, inplace=True)
        
        # Post processing
        try:
            length = target_df.shape[0]
            logger.info(f"Post-processing {length} data points")
            
            df_post_processed = target_df.copy()
            for i in range(0, length, 1):
                if i == 0:
                    df_post_processed.iloc[i] = target_df.iloc[i]
                else:
                    df_post_processed.iloc[i] = (target_df.iloc[i] - target_df.iloc[i-1])
            
            # Automatically generate the CSV file name
            output_csv = Path(grib_path).with_suffix('.csv')
            
            # Save the data to the CSV file
            df_post_processed.to_csv(output_csv, index=False)
            logger.info(f"Saved file as: {output_csv}")
            
            return True, None, df_post_processed, ds
        except Exception as e:
            error_msg = f"Error in post-processing: {str(e)}"
            logger.error(error_msg)
            return False, error_msg, None, ds
    
    except Exception as e:
        error_msg = f"Error processing GRIB file: {str(e)}"
        logger.error(error_msg)
        return False, error_msg, None, None

@app.get("/grib-info/{grib_file_path:path}")
async def get_grib_info(grib_file_path: str):
    """
    Get information about a GRIB file, including number of timesteps.
    
    Args:
        grib_file_path: Path to the GRIB file
        
    Returns:
        Information about the GRIB file
    """
    try:
        grib_path = Path(grib_file_path)
        
        if not grib_path.exists():
            raise HTTPException(status_code=404, detail=f"GRIB file not found: {grib_file_path}")
            
        ds = xr.open_dataset(str(grib_path), engine="cfgrib")
        
        # Collect information about the GRIB file
        info = {
            "dimensions": {name: size for name, size in ds.dims.items()},
            "coordinates": list(ds.coords),
            "data_variables": list(ds.data_vars),
            "attributes": {key: str(value) for key, value in ds.attrs.items()}
        }
        
        # Get specific information about timesteps
        if 'step' in ds.dims:
            info["num_timesteps"] = ds.dims['step']
            info["timestep_values"] = ds.step.values.tolist() if hasattr(ds.step.values, 'tolist') else [str(x) for x in ds.step.values]
        elif 'time' in ds.dims:
            info["num_timesteps"] = ds.dims['time']
            info["timestep_values"] = [str(x) for x in ds.time.values]
            
        # Close the dataset
        ds.close()
        
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing GRIB file: {str(e)}")
        

@app.post("/solar-forecast", response_model=ForecastResponse)
async def solar_forecast(request: ForecastRequest, background_tasks: BackgroundTasks):
#async def solar_forecast(request: ForecastRequest):
    """
    Handle solar forecast requests by processing GRIB files.
    
    If grib_file_path is specified in the request, use that file directly.
    Otherwise, look for a GRIB file in the data folder with the current date pattern.
    Returns an immediate acceptance/rejection response and processes the task in the background.
    """
    current_time = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    output_files = []

    try:
        # Check if the model path exists
        model_path = Path(request.trained_model_path)
        if not model_path.exists():
            # Create rejected response
            response = ForecastResponse(
                jobKey=request.jobKey,
                status="Rejected",
                error="Model path does not exist",
                datetime=current_time
            )
            
            # Send notification for rejection
            notification = NotificationPayload(
                jobKey=request.jobKey,
                status="Rejected",
                error="Model path does not exist",
                datetime=current_time
            )
            send_notification(notification.dict())
            
            return response
        
                # Create directories for data files if they don't exist
        os.makedirs("./data", exist_ok=True)
        os.makedirs("./aod_variables", exist_ok=True)

                # Create acceptance response to return immediately
        acceptance_response = ForecastResponse(
            jobKey=request.jobKey,
            status="Accepted",
            datetime=current_time
        )
        
        # Add the processing task to the background
        background_tasks.add_task(
            process_forecast_request,
            request=request,
            acceptance_time=current_time
        )
        
        # Return acceptance immediately
        return acceptance_response
    
    except Exception as e:
        logger.error(f"Error initializing request: {str(e)}")
        # Create rejected response
        response = ForecastResponse(
            jobKey=request.jobKey,
            status="Rejected",
            error=f"An unexpected error occurred during initialization: {str(e)}",
            datetime=current_time
        )
        
        # Send notification for rejection
        notification = NotificationPayload(
            jobKey=request.jobKey,
            status="Rejected",
            error=f"An unexpected error occurred during initialization: {str(e)}",
            datetime=current_time
        )
        send_notification(notification.dict())
        
        return response

async def process_forecast_request(request: ForecastRequest, acceptance_time: str):
    """
    Process the forecast request in the background.
    
    Args:
        request: The forecast request
        acceptance_time: The time when the request was accepted
    """
    output_files = []
    
    try:
        # Determine which GRIB file to use
        grib_file = None
        using_simulated_data = False
        aod_file_path = None
        
        # If a specific path is provided, use it directly
        if request.grib_file_path:
            grib_file = request.grib_file_path
            logger.info(f"Using provided GRIB file: {grib_file}")
            
            # Check if the specified file exists
            if not Path(grib_file).exists():
                logger.warning(f"Specified GRIB file does not exist: {grib_file}")
                using_simulated_data = True
        else:
            # Otherwise look for the GRIB file with current date pattern
            data_folder = "/data"
            today = datetime.now()
            grib_filename = f"169_{today.year}_{today.month}_{today.day}.grib"
            grib_file = str(Path(data_folder) / grib_filename)
            logger.info(f"Looking for current date GRIB file: {grib_file}")
            
            # Check if the current day file exists
            if not Path(grib_file).exists():
                logger.warning(f"Current day GRIB file does not exist: {grib_file}")
                using_simulated_data = True
        
        # If using real data, process the GRIB file
        df_post_processed = None
        #aod_file_path = None
        if not using_simulated_data:
            logger.info(f"Using actual GRIB file: {grib_file}")
            
            # First try to download AOD data for correction
            aod_success = False
            today_date = datetime.now().strftime("%Y-%m-%d")
            
            try:
                # Extract the lead times from the GRIB file if possible
                leadtime_hours = None
                try:
                    if 'success' in locals() and success and 'ds' in locals():
                        # If we have a successful GRIB file processing, extract lead times
                        if hasattr(ds, 'step') and hasattr(ds.step, 'values'):
                            # Convert step values (nanoseconds) to hours
                            step_values = ds.step.values
                            if isinstance(step_values[0], np.timedelta64):
                                # Convert from numpy.timedelta64 to hours
                                leadtime_hours = [int(td.astype('timedelta64[h]').astype(int)) for td in step_values]
                            else:
                                # If they're already integers, use them directly
                                leadtime_hours = [int(s) for s in step_values]
                            logger.info(f"Extracted lead times from GRIB file: {leadtime_hours}")
                except Exception as e:
                    logger.warning(f"Failed to extract lead times from GRIB file: {str(e)}. Will use default lead times.")
                
                # Download AOD data matching the lead times (if available)
                aod_success, aod_error, aod_file_path = download_aod_data(
                    latitude=request.latitude,
                    longitude=request.longitude,
                    date_str=today_date,
                    leadtime_hours=leadtime_hours
                )
                
                if aod_success:
                    logger.info(f"Successfully downloaded AOD data: {aod_file_path}")
                else:
                    logger.warning(f"Failed to download AOD data: {aod_error}. Will proceed without AOD correction.")
            except Exception as e:
                logger.warning(f"Exception downloading AOD data: {str(e)}. Will proceed without AOD correction.")
                aod_success = False
            
            # Process the GRIB file
            success, error_msg, df_post_processed, grib_ds = process_grib_file(
                grib_file, 
                request.latitude, 
                request.longitude
            )
            
            #print(f"df_post_processed: {df_post_processed}")
            if not success:
                
                # Send notification for rejection
                notification = NotificationPayload(
                    jobKey=request.jobKey,
                    status="Rejected",
                    error=error_msg,
                    datetime=acceptance_time
                )
                send_notification(notification.dict())
                
                return
            
            # Apply AOD correction if AOD data was successfully downloaded
            if aod_success and aod_file_path and df_post_processed is not None:
                try:
                    correction_success, correction_error, df_corrected = apply_aod_correction(
                        df_post_processed=df_post_processed,
                        aod_file_path=aod_file_path,
                        latitude=request.latitude,
                        longitude=request.longitude
                    )
                    
                    if correction_success:
                        logger.info("Successfully applied AOD correction to GRIB data")
                        df_post_processed = df_corrected
                        #print(f"df_post_processed after AOD correction: {df_post_processed}")
                    else:
                        logger.warning(f"Failed to apply AOD correction: {correction_error}. Using uncorrected data.")
                except Exception as e:
                    logger.warning(f"Exception applying AOD correction: {str(e)}. Using uncorrected data.")
        else:
            # Use simulated data from data_pool folder
            logger.info("Using simulated data from data_pool folder")
            
            # Get a random simulation file from the data_pool folder
            data_pool_folder = Path("./data_pool")
            simulation_files = list(data_pool_folder.glob("prediction_*.csv"))
            
            if not simulation_files:
                error_msg = "No simulation files found in data_pool folder"
                logger.error(error_msg)
                
                # Send notification for rejection
                notification = NotificationPayload(
                    jobKey=request.jobKey,
                    status="Rejected",
                    error=error_msg,
                    datetime=acceptance_time
                )
                send_notification(notification.dict())
                
                return
            
            # Select a random simulation file
            import random
            simulation_file = random.choice(simulation_files)
            logger.info(f"Selected simulation file: {simulation_file}")
            
            try:
                # Read the simulation file
                sim_df = pd.read_csv(simulation_file, comment="#", skip_blank_lines=True)
                logger.info(f"Loaded simulation data with columns: {sim_df.columns}")
                
                # Create a post-processed dataframe with the GHI data
                # Convert kWh/m² back to J/m² by multiplying by 3600000
                df_post_processed = pd.DataFrame()
                if 'ghi_kWhm2' in sim_df.columns:
                    df_post_processed['var'] = sim_df['ghi_kWhm2'] * 3600000
                elif 'GHI_kWhm-2' in sim_df.columns:
                    df_post_processed['var'] = sim_df['GHI_kWhm-2'] * 3600000
                else:
                    # Try to find a column with GHI in its name
                    ghi_columns = [col for col in sim_df.columns if 'ghi' in col.lower()]
                    if ghi_columns:
                        df_post_processed['var'] = sim_df[ghi_columns[0]] * 3600000
                    else:
                        # If no GHI column is found, use the third column (as per your file format)
                        df_post_processed['var'] = sim_df.iloc[:, 2] * 3600000
                
                logger.info(f"Created simulated data with {len(df_post_processed)} rows")
                success = True
                error_msg = None
            except Exception as e:
                error_msg = f"Error processing simulation file: {str(e)}"
                logger.error(error_msg)
                
                # Send notification for rejection
                notification = NotificationPayload(
                    jobKey=request.jobKey,
                    status="Rejected",
                    error=error_msg,
                    datetime=acceptance_time
                )
                send_notification(notification.dict())
                
                return
        
        # Create directories for data files if they don't exist
        os.makedirs("./data", exist_ok=True)
        os.makedirs("./aod_variables", exist_ok=True)
        
        # Additional processing for solar position and prediction
        # If we're using simulated data, get the date from the simulation file
        sim_date = None
        if using_simulated_data and 'simulation_file' in locals():
            try:
                sim_date = os.path.basename(simulation_file).replace('prediction_', '').replace('.csv', '')
                logger.info(f"Using simulation date: {sim_date}")
            except Exception as e:
                logger.error(f"Error extracting date from simulation file: {str(e)}")
                # Continue with None
        
        try:
            import pvlib
            from xgboost import XGBRegressor
            
            # Get date for file naming
            if sim_date:
                # If we're using simulated data, use the date from the simulation file
                date = sim_date
            else:
                # Otherwise extract from the GRIB file or use current date
                date = os.path.basename(grib_file)[6:-5] if len(grib_file) > 6 else datetime.now().strftime("%Y_%m_%d")
            
            # Extract timestamps
            if using_simulated_data and 'simulation_file' in locals() and 'sim_df' in locals():
                # For simulated data, use the current date for timestamps instead of the simulation date
                current_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
                timestamps = pd.date_range(start=current_date, periods=len(df_post_processed), freq='1H')
                logger.info(f"Using current date timestamps for simulated data starting from {current_date}")
            elif hasattr(df_post_processed, 'index') and len(df_post_processed.index) > 0:
                timestamps = df_post_processed.index
            else:
                # If index is not properly set, recreate timestamps
                start_timestamp = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
                timestamps = pd.date_range(start=start_timestamp, periods=len(df_post_processed), freq='1H')
            
            # Create 30-minute offset timestamps for solar position calculation
            timedelta = np.timedelta64(30, 'm')
            timestamps_mid1h = timestamps - timedelta
            
            # Calculate solar position
            logger.info(f"Calculating solar position for lat: {request.latitude}, lon: {request.longitude}")
            solar_position = pvlib.solarposition.get_solarposition(timestamps, request.latitude, request.longitude)
            solar_position_mid1h = pvlib.solarposition.get_solarposition(timestamps_mid1h, request.latitude, request.longitude)
            
            # Extract solar zenith angle
            sza_mid1h = solar_position_mid1h['apparent_zenith']
            sza = solar_position['apparent_zenith']
            sza = np.array(sza).flatten()
            sza_mid1h = np.array(sza_mid1h).flatten()
            
            # Prepare dataframe for prediction
            df = pd.DataFrame()
            
            # Add GHI data from CAMS (using post-processed data)
            print(df_post_processed)
            cams_ghi1h_Jm2 = df_post_processed['var'].values if 'var' in df_post_processed.columns else df_post_processed.iloc[:, 0].values
            df['GHI'] = pd.Series(cams_ghi1h_Jm2).astype(float)
            df['SZA_30min_before'] = pd.Series(sza_mid1h).astype(float)
            
            print(df)
            # Identify night times (zenith angle > 90 degrees)
            night_indexes = df[df['SZA_30min_before'] > 90].index
            
            # Load the XGBoost model
            logger.info("Loading XGBoost model")
            model = XGBRegressor()
            model.load_model(str(Path(request.trained_model_path)))   #model_path)) # / "model_xgboost.json"))
            
            # Make predictions
            logger.info("Making predictions")
            y_pred = model.predict(df)
            logger.info(f"Predictions: {y_pred}")

            # Post-process predictions
            predicted = pd.DataFrame(y_pred)
            predicted.loc[predicted.index.isin(night_indexes)] = 0  # Set night values to zero
            predicted[predicted < 0] = 0  # Set negative values to zero
            
            # Create final output dataframe
            final = pd.DataFrame(columns=['timestamp', 'predicted_production', 'ghi_kWhm2'])
            final['timestamp'] = timestamps
            final['predicted_production'] = predicted.values
            final['ghi_kWhm2'] = df['GHI'] / 3600000  # Convert J/m² to kWh/m²
            
            # Instead of saving to CSV, we'll just store the forecasts for the notification payload
            # Convert the dataframe to a more JSON-friendly format
            forecast_data = []
            for idx, row in final.iterrows():
                # Format timestamp to ISO format
                ts = row['timestamp']
                if isinstance(ts, pd.Timestamp):
                    ts = ts.isoformat()
                elif not isinstance(ts, str):
                    ts = str(ts)
                
                forecast_data.append({
                    "timestamp": ts,
                    "predicted_production": float(row['predicted_production']),
                    "ghi_kWhm2": float(row['ghi_kWhm2'])
                })
            
            # Save this for the notification payload
            forecast_json = {
                "forecasts": forecast_data,
                "metadata": {
                    "latitude": request.latitude,
                    "longitude": request.longitude,
                    "altitude": request.altitude,
                    "forecast_date": datetime.now().strftime("%Y-%m-%d"),
                    "total_hours": len(forecast_data),
                    "total_production": float(final['predicted_production'].sum()),
                    "avg_production": float(final['predicted_production'].mean()),
                    "max_production": float(final['predicted_production'].max()),
                    "data_source": "simulated" if using_simulated_data else "real",
                    "aod_corrected": aod_file_path is not None and not using_simulated_data
                }
            }
            
            logger.info(f"Created forecast data with {len(forecast_data)} hours")
            
            # For backward compatibility, still output a CSV file
            output_csv = f'./data/prediction_{date}.csv'
            final.to_csv(output_csv, index=False)
            logger.info(f"Saved prediction file as: {output_csv} (for backward compatibility)")
            
            # Get the file size
            prediction_file = output_csv
            file_size = os.path.getsize(output_csv)
            
            # Add file info to output files list
            output_files.append(FileInfo(
                path=output_csv,
                friendlyname=f"Solar Forecast Data - {date}",
                size=file_size
            ))
            
        except ImportError as e:
            logger.error(f"Required library not available: {str(e)}")
            # Continue without additional processing
        except Exception as e:
            logger.error(f"Error in additional processing: {str(e)}")
            # Continue without failing the whole request
        
        # Send completion notification
        try:
            # Use the forecast JSON data for the notification payload
            if 'forecast_json' in locals() and forecast_json:
                payload_data = forecast_json
            else:
                # Fallback payload if forecast data isn't available
                payload_data = {
                    "status": "completed",
                    "message": "Processing completed, but detailed forecast data is not available"
                }
                
            # Send notification of completion
            notification = NotificationPayload(
                jobKey=request.jobKey,
                status="Completed",
                error=None,
                datetime=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                payload=payload_data,
                files=output_files
            )
            
            send_notification(notification.dict())
        except Exception as e:
            logger.error(f"Error sending completion notification: {str(e)}")
            # Try to send a simplified notification if the detailed one fails
            try:
                simple_notification = NotificationPayload(
                    jobKey=request.jobKey,
                    status="Completed",
                    error=f"Completed with notification error: {str(e)}",
                    datetime=datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                    files=output_files
                )
                send_notification(simple_notification.dict())
            except Exception as inner_e:
                logger.error(f"Failed to send simplified notification: {str(inner_e)}")
        
        # Return success response
        return
    
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        # Create rejected response
        response = ForecastResponse(
            jobKey=request.jobKey,
            status="Rejected",
            error=f"An unexpected error occurred: {str(e)}",
            datetime=acceptance_time
        )
        
        # Send notification for rejection
        notification = NotificationPayload(
            jobKey=request.jobKey,
            status="Rejected",
            error=f"An unexpected error occurred: {str(e)}",
            datetime=acceptance_time
        )
        send_notification(notification.dict())
        
        return response

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)