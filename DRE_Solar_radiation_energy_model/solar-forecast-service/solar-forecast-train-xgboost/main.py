from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, validator
import subprocess
import json
import pandas as pd
import numpy as np
from datetime import datetime
import sys
import os
import re
from typing import Optional
#from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import pvlib
from xgboost import XGBRegressor
import requests

# Set the notification URL and token
NOTIFICATION_URL = os.environ.get("NOTIFICATION_URL", "https://hyrefapp.dev.desp.space/api/Jobs/jobupdate")
NOTIFICATION_TOKEN = os.environ.get("NOTIFICATION_TOKEN", "916ab7c8-acb39e299883-f1ca-419b-816b-7cfb307e6daf883b-aa91b02090b8")
FORECAST_API_URL = os.environ.get("FORECAST_API_URL", "http://solar-forecast-inference-deployment:8000/solar-forecast")

app = FastAPI()

class RequestData(BaseModel):
    longitude: float
    latitude: float
    altitude: float
    user_template_path: str  # Path to user template/CSV file
    model_output_path: Optional[str] = None  # Optional directory or path for saving model
    jobKey: str  # Unique job identifier
    
    # Add validators to check values
    @validator('user_template_path')
    def validate_template_path(cls, v):
        # Convert backslashes to forward slashes for consistency
        v = v.replace('\\', '/')
        
        # Check if file exists
        if not os.path.exists(v):
            raise ValueError(f"User template file not found: {v}")
        return v
        
    @validator('model_output_path')
    def validate_model_path(cls, v):
        if v is None:
            return v
            
        # Convert backslashes to forward slashes for consistency
        v = v.replace('\\', '/')
        
        # If it's a directory, check if it exists
        if os.path.isdir(v):
            return v
            
        # If it's a file path, check if the directory exists
        dir_path = os.path.dirname(v)
        if dir_path and not os.path.exists(dir_path):
            try:
                os.makedirs(dir_path, exist_ok=True)
            except:
                raise ValueError(f"Cannot create directory: {dir_path}")
        return v
def send_notification(notification_data, forecast_api_result=None):
    """Send a notification to the external service"""
    # New endpoint for job updates
    if not NOTIFICATION_URL:
        print("No notification URL configured - skipping notification")
        return False
    
    try:
        # Format data for the new endpoint
        job_key = notification_data.get("jobKey")
        
        # Determine status based on the original notification status
        if notification_data.get("status") == "Failed":
            status = "Error"
            description = notification_data.get("error") or "An unknown error occurred"
        else:
            status = "In-Progress"
            description = "Job is processing normally"
        
        # Add forecast API call result to description if available
        if forecast_api_result is not None:
            if forecast_api_result:
                description += ". Forecast inference API called successfully."
            else:
                description += ". Warning: Forecast inference API call failed."

        # Create the payload in the required format
        update_payload = {
            "jobKey": job_key,
            "status": status,
            "description": description
        }
        
        print(f"Sending notification to {NOTIFICATION_URL}")
        print(f"Notification payload: {json.dumps(update_payload)}")
        
        response = requests.post(
            NOTIFICATION_URL,
            json=update_payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {NOTIFICATION_TOKEN}"
            },
            timeout=10  # Add a timeout to prevent hanging
        )
        
        if response.status_code >= 400:
            print(f"Warning: Notification failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        print(f"Notification sent successfully to {NOTIFICATION_URL}")
        return True
    except requests.exceptions.Timeout:
        print(f"Error: Notification timed out after 10 seconds")
        return False
    except requests.exceptions.ConnectionError:
        print(f"Error: Could not connect to notification service at {NOTIFICATION_URL}")
        return False
    except Exception as e:
        print(f"Error sending notification: {str(e)}")
        return False

def call_forecast_api(model_data):
    """Call the solar forecast API with the trained model info"""
    try:
        print(f"Calling forecast API at {FORECAST_API_URL}")
        response = requests.post(
            FORECAST_API_URL,
            json=model_data,
            headers={"Content-Type": "application/json"},
            timeout=10  # Add a 10-second timeout
        )
        
        if response.status_code >= 400:
            print(f"Warning: Forecast API call failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        print(f"Forecast API call successful with status {response.status_code}")
        try:
            print(f"Response: {response.json()}")
        except:
            print(f"Response: {response.text[:200]}...")
        return True
    except requests.exceptions.Timeout:
        print(f"Error: Forecast API call timed out after 10 seconds")
        return False
    except requests.exceptions.ConnectionError:
        print(f"Error: Could not connect to forecast API at {FORECAST_API_URL}")
        return False
    except Exception as e:
        print(f"Error calling forecast API: {str(e)}")
        return False


async def process_job_async(data: RequestData, background_tasks: BackgroundTasks):
    """Process the job asynchronously and send notifications"""
    current_time = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    forecast_api_result = None

    # Create success/failure notification templates
    success_notification = {
        "jobKey": data.jobKey,
        "status": "Completed",
        "type": "forecast",
        "source": "solar",
        "error": None,
        "datetime": current_time
    }
    
    failure_notification = {
        "jobKey": data.jobKey,
        "status": "Failed",
        "type": "forecast",
        "source": "solar",
        "error": "An error occurred during processing",
        "datetime": current_time
    }
    
    try:
        # Process the job (implementation same as before)
        result = await process_data_internal(data)
        
        # Extract forecast API call result if available
        if 'model_results' in result and isinstance(result['model_results'], dict) and 'forecast_api_call' in result['model_results']:
            forecast_api_result = result['model_results']['forecast_api_call']
            print(f"Extracted forecast API result for notification: {forecast_api_result}")

        # Update success notification with details
        success_notification.update({
            "result": result  # Include the job results
        })
        
        # Send success notification
        # Send success notification with forecast API result
        send_notification(success_notification, forecast_api_result)
        #send_notification(success_notification)
        
        return result
    except Exception as e:
        # Update failure notification with error details
        failure_notification["error"] = str(e)
        
        # Send failure notification
        # Send success notification with forecast API result
        send_notification(success_notification, forecast_api_result)
        #send_notification(failure_notification)
        
        # Re-raise the exception to be handled by the API endpoint
        raise

print("Python Executable:", sys.executable)

@app.post("/process")
async def process_data(data: RequestData, background_tasks: BackgroundTasks):
    """API endpoint for processing forecast jobs"""
    try:
        # Immediately respond with "Accepted" status
        current_time = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        
        # Validate input data
        if not os.path.exists(data.user_template_path):
            # Return rejection response
            return {
                "jobKey": data.jobKey,
                "status": "Rejected",
                "type": "forecast",
                "source": "solar",
                "error": f"User template file not found: {data.user_template_path}",
                "datetime": current_time
            }
        
        # Run the processing in the background
        background_tasks.add_task(process_job_async, data, background_tasks)
        
        # Return immediate acceptance response
        return {
            "jobKey": data.jobKey,
            "status": "Accepted",
            "type": "forecast",
            "source": "solar",
            "error": None,
            "datetime": current_time
        }
    except Exception as e:
        # Return rejection response
        current_time = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        return {
            "jobKey": data.jobKey,
            "status": "Rejected",
            "type": "forecast",
            "source": "solar",
            "error": str(e),
            "datetime": current_time
        }

async def process_data_internal(data: RequestData):
    """Internal function to process the data and build the model"""
    try:
        # CSV file existence is already checked by the validator
        print(f"Processing request with data: {data.dict()}")
        
        # Read the CSV file and extract dates from Timestamp column
        try:
            print(f"Reading user template file: {data.user_template_path}")
            df = pd.read_csv(data.user_template_path)
            
            # Check if Timestamp column exists (case-insensitive check)
            timestamp_col = None
            for col in df.columns:
                if col.lower() == 'timestamp' or col.lower() == 'time_utc':
                    timestamp_col = col
                    break
            
            if not timestamp_col:
                raise HTTPException(status_code=400, detail=f"No timestamp column found in file. Available columns: {', '.join(df.columns)}")
            
            # Convert timestamp column to datetime if it's not already
            try:
                df[timestamp_col] = pd.to_datetime(df[timestamp_col])
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error parsing timestamps: {str(e)}")
            
            # Extract the first and last dates
            start_date = df[timestamp_col].min().strftime('%Y-%m-%d')
            end_date = df[timestamp_col].max().strftime('%Y-%m-%d')
            
            print(f"Extracted date range from CSV: {start_date} to {end_date}")
            
        except pd.errors.EmptyDataError:
            raise HTTPException(status_code=400, detail="CSV file is empty")
        except pd.errors.ParserError:
            raise HTTPException(status_code=400, detail="Error parsing CSV file")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing CSV file: {str(e)}")
        
        # Use date range format for a single call to hda_cams.py
        date_range = f"{start_date}/{end_date}"
        
        # Call hda_cams.py and pass parameters
        cmd = [
            sys.executable, "hda_cams.py", 
            str(data.longitude), 
            str(data.latitude), 
            str(data.altitude), 
            date_range
        ]
        
        print(f"Executing command: {' '.join(cmd)}")
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        print(f"Command completed with return code: {result.returncode}")
        
        if result.returncode != 0:
            print(f"Command stderr: {result.stderr}")
            raise HTTPException(status_code=500, detail=f"Error executing script: {result.stderr}")
        
        # Extract the CAMS file path using the special marker
        cams_file_path = None
        file_path_pattern = r"CAMS_FILE_PATH=(.*?)$"
        
        for line in result.stdout.split('\n'):
            match = re.search(file_path_pattern, line)
            if match:
                cams_file_path = match.group(1)
                break
        
        # Check if the file exists
        file_exists = False
        if cams_file_path and os.path.exists(cams_file_path):
            file_exists = True
        
        # Generate a dynamic model name based on parameters
        date_part = f"{start_date.replace('-', '')}_{end_date.replace('-', '')}" if start_date != end_date else start_date.replace('-', '')
        model_filename = f"model_xgboost_{date_part}_{data.longitude}_{data.latitude}_{data.altitude}.json"

        # If user provided a directory, use it, otherwise use a default
        if data.model_output_path:
            # Check if the provided path is a directory
            if os.path.isdir(data.model_output_path):
                # It's a directory, so append the filename
                model_full_path = os.path.join(data.model_output_path, model_filename)
            else:
                # It's a file path, let's extract the directory
                model_dir = os.path.dirname(data.model_output_path)
                if not model_dir:  # If no directory specified, use current directory
                    model_dir = "."
                # Use the provided directory but with our generated filename
                model_full_path = os.path.join(model_dir, model_filename)
        else:
            # Use current directory if no path specified
            model_full_path = model_filename
            
        # Ensure the directory exists
        os.makedirs(os.path.dirname(os.path.abspath(model_full_path)), exist_ok=True)
        
        # Initialize model results
        model_results = {}
        
        # Process the data and train model if file exists
        if file_exists:
            try:
                # Load the CAMS data (hourly)
                print("Loading CAMS data...")
                try:
                    # Function to read the CAMS CSV with custom headers from the last comment line
                    def read_csv_with_custom_headers(file_path):
                        with open(file_path, 'r', encoding='utf-8') as file:
                            lines = file.readlines()
                        
                        # Find the last line that starts with #
                        header_line = None
                        header_index = -1
                        for i, line in enumerate(lines):
                            if line.startswith("#"):
                                header_line = line.strip("#").strip()
                                header_index = i
                        
                        if header_line is None:
                            raise ValueError("No header line starting with # found in the file.")
                        
                        # Use ; as the delimiter to extract column names
                        column_names = [col.strip() for col in header_line.split(";")]
                        
                        # Read the CSV, skipping lines until after the header line
                        data_start = header_index + 1
                        df = pd.read_csv(file_path, skiprows=data_start, names=column_names, sep=";")
                        return df
                    
                    # Use the custom function to read the CAMS data
                    cams_df = read_csv_with_custom_headers(cams_file_path)
                    print(f"Successfully read CAMS data with custom headers: {cams_df.columns.tolist()}")
                    
                except Exception as e:
                    print(f"Error reading CAMS data with custom headers: {str(e)}")
                    # Fallback to standard CSV reading
                    try:
                        # Try with semicolon delimiter
                        cams_df = pd.read_csv(cams_file_path, comment='#', delimiter=';')
                        print(f"Fallback: Read CAMS data with semicolon delimiter. Columns: {cams_df.columns}")
                    except Exception as sub_e:
                        print(f"Semicolon delimiter failed: {str(sub_e)}")
                        # Try with comma delimiter as last resort
                        cams_df = pd.read_csv(cams_file_path, comment='#')
                        print(f"Fallback: Read CAMS data with default delimiter. Columns: {cams_df.columns}")
                
                # Read user template CSV - already loaded as df above
                user_df = df  # Reuse the DataFrame we already loaded
                
                def combine_data(user_df, cams_df, latitude, longitude):
                    """
                    Combine user data (15-min intervals) with CAMS data (hourly intervals).
                    For each CAMS hour, calculates the mean of the previous 4 user data points
                    and adds solar zenith angle (SZA) calculated 30 minutes before each timestamp.
                    Only includes timestamps that exist in both datasets.
                    
                    Parameters:
                    -----------
                    user_df : pandas.DataFrame
                        DataFrame with user data, containing 'time_utc' (timezone-aware) and 'total_production_active_power_kW' columns
                    cams_df : pandas.DataFrame
                        DataFrame with CAMS data, containing 'Obs_period' and 'GHI' columns
                    latitude : float
                        Latitude of the location for SZA calculation
                    longitude : float
                        Longitude of the location for SZA calculation
                        
                    Returns:
                    --------
                    pandas.DataFrame
                        Combined data with timestamp, mean power, GHI, and SZA values
                    """
                    # Make a copy to avoid modifying the original DataFrames
                    user_df = user_df.copy()
                    cams_df = cams_df.copy()
                    
                    # Ensure user timestamp column is in datetime format with UTC timezone
                    user_df['time_utc'] = pd.to_datetime(user_df['time_utc'])
                    
                    # Extract the end timestamp from each observation period in CAMS data
                    # And make it timezone-aware (UTC) to match the user data
                    cams_df['timestamp'] = cams_df['Observation period'].apply(
                        lambda x: pd.to_datetime(x.split('/')[1]).tz_localize('UTC')
                    )
                    
                    # Find the latest timestamp in user_df
                    latest_user_timestamp = user_df['time_utc'].max()
                    
                    # Filter cams_df to only include rows where timestamp is <= latest_user_timestamp
                    cams_df = cams_df[cams_df['timestamp'] <= latest_user_timestamp]
                    
                    # Create result DataFrame
                    results = []
                    
                    for _, cams_row in cams_df.iterrows():
                        hour_end = cams_row['timestamp']
                        
                        # Get the 4 readings before or at this hour end
                        matching_rows = user_df[user_df['time_utc'] <= hour_end].tail(4)
                        
                        if len(matching_rows) == 4:
                            # Calculate mean power
                            mean_power = matching_rows['total_production_active_power_kW'].mean()
                            
                            # Calculate time 30 minutes before this timestamp for SZA calculation
                            sza_time = hour_end - pd.Timedelta(minutes=30)
                            
                            # Calculate solar position (SZA)
                            try:
                                solar_position = pvlib.solarposition.get_solarposition(
                                    time=sza_time,
                                    latitude=latitude,
                                    longitude=longitude
                                )
                                
                                # Extract the zenith angle
                                sza = solar_position.loc[sza_time, 'zenith']
                            except Exception as e:
                                print(f"Error calculating solar position: {str(e)}")
                                # Use a default value or skip this row
                                sza = 90.0  # Default to horizon
                            
                            results.append({
                                'timestamp': hour_end,
                                'mean_power_kW': mean_power,
                                'GHI': cams_row['GHI'],
                                'SZA_30min_before': sza
                            })
                    
                    return pd.DataFrame(results)
                
                # Combine user data with CAMS data   
                print(f"Combining data with latitude={data.latitude}, longitude={data.longitude}...")
                result_df = combine_data(user_df, cams_df, data.latitude, data.longitude)
                
                # Store row count for reporting
                combined_row_count = len(result_df)
                
                # Drop timestamp column, unnecessary for model training
                result_df = result_df.drop(['timestamp'], axis=1)
                
                # Normalize the data
                columns_to_normalize = ['mean_power_kW', 'GHI', 'SZA_30min_before']
                
                # Create a MinMaxScaler
                #scaler = MinMaxScaler()
                
                #result_df[columns_to_normalize] = scaler.fit_transform(result_df[columns_to_normalize])
                
                # Creating feature variables 
                X = result_df.drop(['mean_power_kW'], axis=1) 
                y = result_df['mean_power_kW'] 
                
                # Creating train and test sets
                print("Splitting data into train/test sets...")
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, train_size=0.8, random_state=101, shuffle=False)
                
                # Train the model
                print("Training XGBoost model...")
                model = XGBRegressor()
                model.fit(X_train, y_train)
                
                # Make predictions and evaluate
                y_pred = model.predict(X_test)
                r2 = r2_score(y_test, y_pred)
                mse = mean_squared_error(y_test, y_pred)
                mae = mean_absolute_error(y_test, y_pred)
                rmse = np.sqrt(mse)
                mbe = np.mean(np.array(y_pred).reshape(-1, 1) - np.array(y_test).reshape(-1, 1))
                
                print(f"Model performance - R² score: {r2:.4f}, RMSE: {rmse:.4f}")
                
                # Save the model
                print(f"Saving model to {model_full_path}...")
                model.save_model(model_full_path)
                
                # Call the solar forecast API with model information
                forecast_request = {
                    "longitude": data.longitude,
                    "latitude": data.latitude,
                    "altitude": data.altitude,
                    "trained_model_path": model_full_path,
                    "jobKey": data.jobKey
                }

                # Call the forecast API
                forecast_api_result = call_forecast_api(forecast_request)
                print(f"Forecast API call result: {'Success' if forecast_api_result else 'Failed'}")
                
                # Store results for response
                model_results = {
                    "training_samples": len(X_train),
                    "testing_samples": len(X_test),
                    "combined_rows": combined_row_count,
                    "metrics": {
                        "r2_score": float(r2),
                        "mean_squared_error": float(mse),
                        "mean_absolute_error": float(mae),
                        "root_mean_squared_error": float(rmse),
                        "mean_bias_error": float(mbe)
                    },
                    "model_saved_to": model_full_path,
                    "forecast_api_call": forecast_api_result
                }
                
            except Exception as e:
                print(f"Error in data processing or model training: {str(e)}")
                import traceback
                traceback.print_exc()
                model_results = {
                    "error": str(e),
                    "traceback": traceback.format_exc()
                }
        
        return {
            "message": "Script executed successfully", 
            "date_range": f"{start_date} to {end_date}",
            "cams_file_path": cams_file_path,
            "file_exists": file_exists,
            "model_save_path": model_full_path if 'model_full_path' in locals() else None,
            "model_results": model_results,
            "jobKey": data.jobKey  # Include jobKey in results
        }
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        print(f"Exception in process_data: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Simple test endpoint
@app.get("/test")
def test_endpoint():
    return {"status": "API is running"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)