"""
Module: cams_tools

Description:
    A series of tools that are used for generating the Solar Products in the DRE platform based on user's input.

Author:
    Rizos-Theodoros Chadoulis

Date:
    2024-07-03

"""
# Standard libraries
from abc import ABC, abstractmethod
import calendar
from datetime import datetime, timezone, timedelta
import logging
import math
import os
import statistics
import warnings
from pathlib import Path
from typing import Any, Dict, Optional

# Third-party libraries
import destinelab as deauth
import ephem
import numpy as np
import pandas as pd
import pvlib
import requests
from tqdm import tqdm
import xarray as xr

HTTP_SUCCESS_CODE = 200


class Authentication:
    """
    Handles authentication against the Destination Earth login endpoint.

    :param dedl_user: Username for DEDL authentication.
    :type dedl_user: str
    :param dedl_password: Password for DEDL authentication.
    :type dedl_password: str
    :param session: Optional requests session for HTTP calls.
    :type session: requests.Session, optional
    """

    TOKEN_URL = (
        "https://identity.data.destination-earth.eu/auth/realms/dedl/"
        "protocol/openid-connect/token"
    )

    def __init__(
        self,
        dedl_user: str,
        dedl_password: str,
        session: Optional[requests.Session] = None,
    ):
        if not dedl_user or not dedl_password:
            raise ValueError("Both dedl_user and dedl_password must be provided and non-empty.")

        self.dedl_user = dedl_user
        self.dedl_password = dedl_password
        self.session = session or requests.Session()
        self.logger = logging.getLogger(__name__)

    def authenticate(self) -> Dict[str, str]:
        """
        Authenticates with DEDL and returns authorization headers.

        :raises requests.HTTPError: If the authentication request fails.

        :return: A dict containing the Authorization header with bearer token.
        :rtype: Dict[str, str]
        """
        payload = {
            "grant_type": "password",
            "scope": "openid",
            "client_id": "hda-public",
            "username": self.dedl_user,
            "password": self.dedl_password,
        }
        headers = {"Content-Type": "application/x-www-form-urlencoded"}

        self.logger.debug("Requesting access token from DEDL")
        response = self.session.post(self.TOKEN_URL, data=payload, headers=headers)
        try:
            response.raise_for_status()
        except requests.HTTPError as error:
            self.logger.error("Authentication failed: %s", error)
            raise

        token = response.json().get("access_token")
        if not token:
            message = "Authentication succeeded but no access_token found in response"
            self.logger.error(message)
            raise RuntimeError(message)

        return {"Authorization": f"Bearer {token}"}

    def authenticate_v2(self) -> Dict[str, str]:

        auth = deauth.AuthHandler(self.dedl_user, self.dedl_password)
        access_token = auth.get_token()
        if access_token is not None:
            print("DEDL/DESP Access Token Obtained Successfully")
        else:
            print("Failed to Obtain DEDL/DESP Access Token")

        return {"Authorization": f"Bearer {access_token}"}


class BaseQuery(ABC):
    """
    Abstract base class for CAMS queries (forecast, assessment, etc.).

    :param auth: An Authentication instance for accessing the CAMS API.
    """

    def __init__(self, auth: Authentication) -> None:
        self.auth = auth

    @property
    @abstractmethod
    def collection(self) -> str:
        """
        The CAMS collection name to query.

        :returns: The collection identifier (e.g., 'cams_forecast').
        """
        raise NotImplementedError

    @abstractmethod
    def validate(self) -> None:
        """
        Validates the query parameters.

        :raises ValueError: If any parameter is invalid.
        """
        raise NotImplementedError

    @abstractmethod
    def build_payload(self) -> Dict[str, Any]:
        """
        Builds the JSON payload for the `/stac/search` POST request.

        :returns: A dictionary representing the request body.
        """
        raise NotImplementedError

    @abstractmethod
    def download(self) -> str:
        """
        Executes the API request and downloads the result to a local file.

        :returns: The file path of the downloaded data.
        :raises RuntimeError: If the download fails.
        """
        raise NotImplementedError

    @abstractmethod
    def load_and_preprocess_df(self) -> pd.DataFrame:
        """
        Loads the downloaded data into a pandas DataFrame and applies preprocessing steps.

        :returns: A processed pandas DataFrame ready for analysis.
        :raises RuntimeError: If loading or preprocessing fails.
        """
        raise NotImplementedError


class AssessmentQuery(BaseQuery):

    def __init__(
            self,
            latitude_user_input,
            longitude_user_input,
            start_datetime,
            end_datetime,
            timestep_user_input,
            sky_type_user_input,
            time_reference_user_input,
            output_format_user_input,
            altitude_user_input,
            results_directory
    ):

        auth = Authentication(
            "***@***",
            "***"
        )

        super().__init__(auth)
        self.latitude_user_input = latitude_user_input
        self.longitude_user_input = longitude_user_input
        self.start_datetime = start_datetime
        self.end_datetime = end_datetime
        self.timestep_user_input = timestep_user_input
        self.sky_type_user_input = sky_type_user_input
        self.time_reference_user_input = time_reference_user_input
        self.output_format_user_input = output_format_user_input
        self.altitude_user_input = altitude_user_input
        self.solar_constant = 1316
        self.datetime_user_input = None
        self.original_df = None
        self.filename = None
        self.auth = auth
        self.collection = "EO.ECMWF.DAT.CAMS_SOLAR_RADIATION_TIMESERIES"
        self.results_directory = results_directory

    def validate(self):

        # Checking if Lat/Lon values are valid
        if not (-90 <= self.latitude_user_input <= 90):
            raise ValueError(f"Invalid latitude: {self.latitude_user_input}. Latitude must be between -90 and 90.")
        if not (-180 <= self.longitude_user_input <= 180):
            raise ValueError(f"Invalid longitude: {self.longitude_user_input}. Longitude must be between -180 and 180.")

        # Validate datetime inputs and produce datetime string
        self.datetime_user_input = self.validate_and_preprocess_datetime()
        # Output Example: "2014-01-01T00:00:00Z/2023-01-01T00:00:00Z"

        # Timestep should take only one of the predefined values
        valid_time_steps = ['15minute', '1day', '1hour', '1minute', '1month']
        if self.timestep_user_input not in valid_time_steps:
            raise ValueError(f"Invalid timestep: {self.timestep_user_input}. Must be one of {valid_time_steps}")

    def validate_and_preprocess_datetime(self):
        """
        A function that validates and preprocesses user's datetime input
        :return: A string in the following format "{YYYY}-{MM}-{DD}T{HH}:{MM}:{SS}Z/{YYYY}-{MM}-{DD}T{HH}:{MM}:{SS}Z"
        """

        # Ensure the datetime inputs are in the correct format
        try:
            start_dt = datetime.strptime(self.start_datetime, "%Y-%m-%dT%H:%M:%S")
            end_dt = datetime.strptime(self.end_datetime, "%Y-%m-%dT%H:%M:%S")
        except ValueError as e:
            raise ValueError("Incorrect datetime format, should be YYYY-MM-DDTHH:MM:SS") from e

        # Ensure that the starting datetime precedes the ending datetime
        if start_dt >= end_dt:
            raise ValueError("The start datetime must be before the end datetime")

        # Format the date times with the 'Z' suffix to indicate UTC time
        start_dt_str = start_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        end_dt_str = end_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

        return f"{start_dt_str}/{end_dt_str}"

    def build_payload(self):
        """
        A function for creating the json object that will be used for querying the CAMS Solar Radiation Data

        :return: A json object that will be used for querying the CAMS Solar Radiation Data
        """
        return {
            "collections": ["EO.ECMWF.DAT.CAMS_SOLAR_RADIATION_TIMESERIES"],
            "datetime": self.datetime_user_input,
            "query": {
                "sky_type": {
                    "eq": self.sky_type_user_input
                },
                "time_step": {
                    "eq": self.timestep_user_input
                },
                "time_reference": {
                    "eq": self.time_reference_user_input
                },
                "location": {
                    "eq": {
                        "latitude": self.latitude_user_input,
                        "longitude": self.longitude_user_input
                    }
                },
                "altitude": {
                    "eq": self.altitude_user_input
                },
                "format": {
                    "eq": self.output_format_user_input
                }
            }
        }

    def download(self) -> Path:
        """
        A function that takes care of downloading the files from the CAMS Solar Radiation Data.
        :return: The path to the downloaded file
        """

        auth_headers = self.auth.authenticate()
        self.validate()
        query_json = self.build_payload()

        response = requests.post(
            "https://hda.data.destination-earth.eu/stac/search",
            headers=auth_headers,
            json=query_json
        )

        # Requests to EO.ECMWF.DAT.DT_EXTREMES always return a single item containing all the requested data
        product = response.json()["features"][0]

        # DownloadLink is an asset representing the whole product
        download_url = product["assets"]["downloadLink"]["href"]

        direct_download_url = ''
        response = requests.get(download_url, headers=auth_headers)

        if response.status_code == HTTP_SUCCESS_CODE:
            direct_download_url = product['assets']['downloadLink']['href']
        else:
            print(response.json())

        # we poll as long as the data is not ready
        if direct_download_url == '':
            while url := response.headers.get("Location"):
                print(f"order status: {response.json()['status']}")
                response = requests.get(url, headers=auth_headers, stream=True)
                response.raise_for_status()

        self.filename = 'cams_solar_rad_{}_{}_{}.csv'.format(
            str(self.latitude_user_input).replace(".", "-"),
            str(self.longitude_user_input).replace(".", "-"),
            self.timestep_user_input
        )

        total_size = int(response.headers.get("content-length", 0))

        csv_file_path = self.results_directory / self.filename

        with tqdm(total=total_size, unit="B", unit_scale=True) as progress_bar:
            with open(csv_file_path, 'wb') as f:
                for chunk in response.iter_content(1024):
                    progress_bar.update(len(chunk))
                    f.write(chunk)

        return csv_file_path

    def load_and_preprocess_df(self):
        """
        This function reads the CSV file containing the CAMS Solar Radiation data, extracts
        the 'month_year' and 'month' information from the observation period, and stores
        the processed DataFrame in the `original_df` attribute for further analysis.
        :return:
        """
        csv_path = self.results_directory / self.filename

        df = pd.read_csv(csv_path, delimiter=';', skiprows=42)

        # Extract month and year from the first part of the datetime range
        df['month_year'] = df['# Observation period'].apply(lambda x: pd.to_datetime(x.split('/')[0]).strftime('%Y-%m'))
        df['month'] = df['# Observation period'].apply(
            lambda x: datetime.strptime(x.split('/')[0], "%Y-%m-%dT%H:%M:%S.%f").month)
        # Adding a new column for DOY
        df['doy'] = df['# Observation period'].apply(
            lambda x: date_to_doy(x.split('/')[0].split('T')[0]))
        df['da'] = df['doy'].apply(doy_to_mean_anomaly)
        df['re'] = df['da'].apply(da_to_re)

        self.original_df = df
        return df

    def get_multi_year_monthly_means(self, variable):
        """
        Calculate multi-year monthly means for a given variable.

        This function loads and preprocesses the data, then calculates the average value
        of the specified variable for each month across multiple years. The result is a
        set of average monthly values for the variable, which can be used to analyze
        seasonal trends over the years.

        :param variable: The name of the variable for which the multi-year monthly means should be calculated.
        :return:
        """

        self.original_df = self.load_and_preprocess_df()

        # Calculate the average by month and year
        temp_df = self.original_df.groupby('month_year')[variable].sum().reset_index()
        temp_df['month'] = temp_df['month_year'].apply(lambda x: x[5:])

        intra_annual_mean = temp_df.groupby('month')[variable].mean().reset_index()

        return intra_annual_mean['month'].astype(int), intra_annual_mean[variable].astype(float)

    def get_corrected_solar_constant(self):

        # Loading
        self.original_df = self.load_and_preprocess_df()
        corrected_solar_constant = self.original_df['re'] * self.solar_constant
        return corrected_solar_constant

    def get_clearness_index(self):

        toa_irradiance = self.get_corrected_solar_constant()
        clearness_index = self.original_df['GHI'] / toa_irradiance
        clearness_index = clearness_index.replace(0.0, np.nan)
        start_date = pd.to_datetime(self.original_df['# Observation period'].apply(lambda x: x.split('/')[0]))

        clearness_index.index = start_date
        print(start_date)

        return clearness_index

    def collection(self):
        return "EO.ECMWF.DAT.CAMS_SOLAR_RADIATION_TIMESERIES"


class CAMSGlobalAtmosphericCompositionForecast(BaseQuery):

    def __init__(
            self,
            latitude_user_input,
            longitude_user_input,
            timestep_user_input
    ):

        auth = Authentication(
            "***@***",
            "***"
        )

        super().__init__(auth)
        self.latitude_user_input = latitude_user_input
        self.longitude_user_input = longitude_user_input
        self.timestep_user_input = timestep_user_input
        self.solar_constant = 1316
        self.datetime_user_input = None
        self.original_df = None
        self.filename = None
        self.auth = auth
        self.date_str = datetime.now().strftime("%Y-%m-%d")

    def validate(self):

        # Checking if Lat/Lon values are valid
        if not (-90 <= self.latitude_user_input <= 90):
            raise ValueError(f"Invalid latitude: {self.latitude_user_input}. Latitude must be between -90 and 90.")
        if not (-180 <= self.longitude_user_input <= 180):
            raise ValueError(
                f"Invalid longitude: {self.longitude_user_input}. Longitude must be between -180 and 180.")

        # Timestep should take only one of the predefined values
        valid_time_steps = ['15minute', '1day', '1hour', '1minute', '1month']
        if self.timestep_user_input not in valid_time_steps:
            raise ValueError(f"Invalid timestep: {self.timestep_user_input}. Must be one of {valid_time_steps}")

    def build_payload(self):

        # Use default lead time hours if not specified
        leadtime_hours = list(range(0, 48))  # Default 0 to 48 hours

        min_lon = self.longitude_user_input - 0.2
        min_lat = self.latitude_user_input - 0.2
        max_lon = self.longitude_user_input + 0.2
        max_lat = self.latitude_user_input + 0.2

        bbox = [min_lon, min_lat, max_lon, max_lat]

        # Format date for the search query
        date_time_str = f"{self.date_str}T00:00:00Z/{self.date_str}T23:59:59Z"

        # Convert lead time hours to strings for the API
        leadtime_str = [str(h) for h in leadtime_hours]

        json = {
            "collections": [self.collection()],
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

        return json

    def download(self):
        """
        A function that takes care of downloading the files from the CAMS Solar Radiation Data.
        :return: The path to the downloaded file
        """

        auth_headers = self.auth.authenticate_v2()
        self.validate()
        query_json = self.build_payload()

        response = requests.post(
            "https://hda.data.destination-earth.eu/stac/search",
            headers=auth_headers,
            json=query_json
        )

        # Requests to EO.ECMWF.DAT.DT_EXTREMES always return a single item containing all the requested data
        product = response.json()["features"][0]

        # DownloadLink is an asset representing the whole product
        download_url = product["assets"]["downloadLink"]["href"]

        direct_download_url = ''
        response = requests.get(download_url, headers=auth_headers)

        if response.status_code == HTTP_SUCCESS_CODE:
            direct_download_url = product['assets']['downloadLink']['href']
        else:
            print(response.json())

        # we poll as long as the data is not ready
        if direct_download_url == '':
            while url := response.headers.get("Location"):
                print(f"order status: {response.json()['status']}")
                response = requests.get(url, headers=auth_headers, stream=True)
                response.raise_for_status()

        self.filename = 'cams_global_atmospheric_compo_forecast_{}_{}_{}_{}.grib'.format(
            str(self.latitude_user_input).replace(".", "-"),
            str(self.longitude_user_input).replace(".", "-"),
            self.date_str,
            self.timestep_user_input
        )

        total_size = int(response.headers.get("content-length", 0))

        with tqdm(total=total_size, unit="B", unit_scale=True) as progress_bar:
            with open(os.path.join('/', 'output', self.filename), 'wb') as f:
                for data in response.iter_content(1024):
                    progress_bar.update(len(data))
                    f.write(data)

        return os.path.join('/', 'output',  self.filename)

    def collection(self):
        return "EO.ECMWF.DAT.CAMS_GLOBAL_ATMOSHERIC_COMPO_FORECAST"

    def load_and_preprocess_df(self) -> pd.DataFrame:

        now_utc = datetime.now(timezone.utc)
        year, month, day = now_utc.year, now_utc.month, now_utc.day

        # 3.2. Loading and preprocessing .grib file
        self.original_df = preprocess_grib_file(
            "/output/169_{}_{}_{}.grib".format(year, str(month).zfill(2), str(day).zfill(2)),
            self.latitude_user_input,
            self.longitude_user_input,
            'aod550'
        )

        self.original_df['month_year'] = (
            self.original_df.index
            .apply(lambda x: pd.to_datetime(x.split('/')[0]).strftime('%Y-%m'))
        )
        self.original_df['month'] = (
            self.original_df.index
            .apply(lambda x: datetime.strptime(x.split('/')[0], "%Y-%m-%dT%H:%M:%S.%f").month)
        )
        # Adding a new column for DOY
        self.original_df['doy'] = self.original_df.index.apply(
            lambda x: date_to_doy(x.split('/')[0].split('T')[0]))
        self.original_df['da'] = self.original_df['doy'].apply(doy_to_mean_anomaly)
        self.original_df['re'] = self.original_df['da'].apply(da_to_re)

        return self.original_df

    def get_corrected_solar_constant(self):

        # Loading
        self.original_df = self.load_and_preprocess_df()
        corrected_solar_constant = self.original_df['re'] * self.solar_constant
        return corrected_solar_constant

    def get_clearness_index(self):

        toa_irradiance = self.get_corrected_solar_constant()
        clearness_index = self.original_df['GHI'] / toa_irradiance
        clearness_index = clearness_index.replace(0.0, np.nan)
        start_date = pd.to_datetime(self.original_df['# Observation period'].apply(lambda x: x.split('/')[0]))
        clearness_index.index = start_date

        return clearness_index


class ForecastQuery(BaseQuery):

    def __init__(
            self,
            latitude_user_input,
            longitude_user_input,
            timestep_user_input,
            sky_type_user_input,
            time_reference_user_input,
            output_format_user_input,
            altitude_user_input,
            selected_date=None
    ):

        auth = Authentication(
            "***@***",
            "***"
        )

        super().__init__(auth)
        self.latitude_user_input = latitude_user_input
        self.longitude_user_input = longitude_user_input
        self.timestep_user_input = timestep_user_input
        self.sky_type_user_input = sky_type_user_input
        self.time_reference_user_input = time_reference_user_input
        self.output_format_user_input = output_format_user_input
        self.altitude_user_input = altitude_user_input
        self.solar_constant = 1316
        self.datetime_user_input = None
        self.original_df = None
        self.filename = None
        self.auth = auth

        # Using current date if 'selected_date' was not provided, else use 'selected_date'
        if selected_date is None:
            self.selected_date = (
                datetime.now(timezone.utc)
                .replace(hour=0, minute=0, second=0, microsecond=0)
                .strftime('%Y-%m-%dT%H:%M:%SZ')
            )
        else:
            self.selected_date = selected_date

    def validate(self):

        # Checking if Lat/Lon values are valid
        if not (-90 <= self.latitude_user_input <= 90):
            raise ValueError(f"Invalid latitude: {self.latitude_user_input}. Latitude must be between -90 and 90.")
        if not (-180 <= self.longitude_user_input <= 180):
            raise ValueError(f"Invalid longitude: {self.longitude_user_input}. Longitude must be between -180 and 180.")

        # Timestep should take only one of the predefined values
        valid_time_steps = ['15minute', '1day', '1hour', '1minute', '1month']
        if self.timestep_user_input not in valid_time_steps:
            raise ValueError(f"Invalid timestep: {self.timestep_user_input}. Must be one of {valid_time_steps}")

    def build_payload(self):

        steps = "/".join(f"{i}-{i+1}" for i in range(48))

        filters = {
            key: {"eq": value}
            for key, value in {
                "class": "d1",  # fixed (rd or d1)
                "dataset": "extremes-dt",  # fixed extreme dt
                "expver": "0001",  # fixed experiment version
                "stream": "oper",  # fixed oper
                "step": steps,  # "0-1/1-2", # "0/6/12/18/24",    # Forcast step hourly (1..96)
                "type": "fc",  # fixed forecasted fields
                "levtype": "sfc",
                "param": "169"
            }.items()
        }

        return {
            "collections": ["EO.ECMWF.DAT.DT_EXTREMES"],
            "datetime": self.selected_date,
            "query": filters
        }

    def download(self):
        """
        A function that takes care of downloading the files from the CAMS Solar Radiation Data.
        :return: The path to the downloaded file
        """

        auth_headers = self.auth.authenticate_v2()
        self.validate()
        query_json = self.build_payload()

        # --------------------------------------------------------------------------------------------------------------
        # Creating .GRIB filename
        # --------------------------------------------------------------------------------------------------------------

        param = query_json["query"]["param"]["eq"]  # Parameter (e.g., 157)
        day = self.selected_date[8:10]  # Day (e.g., "25")
        month = self.selected_date[5:7]  # Month (e.g., "11")
        year = self.selected_date[0:4]

        self.filename = '{}_{}_{}_{}.grib'.format(
            param,
            year,
            month,
            day
        )

        # --------------------------------------------------------------------------------------------------------------
        # Checking if .GRIB file has already been downloaded and if it is complete, and returning its location.
        # --------------------------------------------------------------------------------------------------------------

        # If it is early in the day, then today's forecast is not ready yet, so it returns a .grib file of a few bytes.

        # Checking if the file exists
        if os.path.exists(f"/output/{self.filename}"):

            # Checking filesize, throwing an error if its below a threshold
            file_size = os.path.getsize(f"/output/{self.filename}")

            if file_size < 100:
                return {
                    "success": False,
                    "message": f"File already exists but is corrupted."
                }

            print(self.filename, flush=True)
            return {
                    "success": True,
                    "path": os.path.join('/', 'output',  self.filename)
                }

        else:
            pass

        # --------------------------------------------------------------------------------------------------------------
        # Downloading .GRIB file
        # --------------------------------------------------------------------------------------------------------------

        response = requests.post(
            "https://hda.data.destination-earth.eu/stac/search",
            headers=auth_headers,
            json=query_json
        )

        print(response.json()["features"][0])

        # Requests to EO.ECMWF.DAT.DT_EXTREMES always return a single item containing all the requested data
        product = response.json()["features"][0]

        # DownloadLink is an asset representing the whole product
        download_url = product["assets"]["downloadLink"]["href"]

        direct_download_url = ''
        response = requests.get(download_url, headers=auth_headers)

        if response.status_code == HTTP_SUCCESS_CODE:
            direct_download_url = product['assets']['downloadLink']['href']
        else:
            try:
                print(response.json())
            except ValueError:
                print("Non-JSON response received:")
                print(response.text)

        # we poll as long as the data is not ready
        if direct_download_url == '':
            while url := response.headers.get("Location"):
                print(f"order status: {response.json()['status']}")
                response = requests.get(url, headers=auth_headers, stream=True)
                response.raise_for_status()

        # --------------------------------------------------------------------------------------------------------------
        # Saving .GRIB file
        # --------------------------------------------------------------------------------------------------------------

        total_size = int(response.headers.get("content-length", 0))

        print(f"downloading {self.filename}")

        with tqdm(total=total_size, unit="B", unit_scale=True) as progress_bar:
            with open(os.path.join('/', 'output', self.filename), 'wb') as f:
                for data in response.iter_content(1024):
                    progress_bar.update(len(data))
                    f.write(data)

        # Checking filesize, throwing an error if its below a threshold
        file_size = os.path.getsize(f"/output/{self.filename}")

        if file_size < 100:
            return {
                "success": False,
                "message": f"File already exists but is corrupted."
            }

        return {
                    "success": True,
                    "path": os.path.join('/', 'output',  self.filename)
                }

    def load_and_preprocess_df(self) -> pd.DataFrame:

        day = self.selected_date[8:10]  # Day (e.g., "25")
        month = self.selected_date[5:7]  # Month (e.g., "11")
        year = self.selected_date[0:4]

        self.filename = '{}_{}_{}_{}.grib'.format(
            '169',
            year,
            month,
            day
        )

        # 3.2. Loading and preprocessing .grib file
        self.original_df = preprocess_grib_file(
            os.path.join("/", "output", self.filename),
            self.latitude_user_input,
            self.longitude_user_input,
            'ssrd'
        )

        # Extract month_year directly
        self.original_df['month_year'] = self.original_df.index.strftime('%Y-%m')

        # Extract month directly
        self.original_df['month'] = self.original_df.index.month

        # Adding a new column for DOY
        self.original_df['doy'] = self.original_df.index.dayofyear

        self.original_df['da'] = self.original_df['doy'].apply(doy_to_mean_anomaly)
        self.original_df['re'] = self.original_df['da'].apply(da_to_re)

        return self.original_df

    def collection(self):
        return "EO.ECMWF.DAT.CAMS_SOLAR_RADIATION_TIMESERIES"

    def get_corrected_solar_constant(self):

        corrected_solar_constant = self.original_df['re'] * self.solar_constant
        return corrected_solar_constant

    def get_clearness_index(self):

        toa_irradiance = self.get_corrected_solar_constant()
        clearness_index = self.original_df['GHI'] / toa_irradiance
        clearness_index = clearness_index.replace(0.0, np.nan)

        return clearness_index


# ----------------------------------------------------------------------------------------------------------------------
# Handling GRIB files
# ----------------------------------------------------------------------------------------------------------------------

def preprocess_grib_file(grib_path, target_latitude, target_longitude, variable_name):

    # Opening GRIB datasets
    ds = xr.open_dataset(grib_path, engine='cfgrib')

    # Getting the latitudes and longitudes as arrays
    latitudes, longitudes = ds["latitude"].values, ds["longitude"].values

    # Calculating the distance to each lat/lon point
    distances = np.sqrt((latitudes - target_latitude) ** 2 + (longitudes - target_longitude) ** 2)

    # Finding the index of the minimum distance
    closest_idx = distances.argmin()

    # Extracting the data at the closest latitude and longitude
    if variable_name == 'ssrd':

        selected_data = ds[variable_name].isel(values=closest_idx)

        # Finding the starting timestamp
        start_timestamp = np.datetime64(selected_data.time.values)

        # Adding the time deltas to the start time
        datetimes = start_timestamp + selected_data.step

        # Turning into pandas DatetimeIndex or DataFrame if needed
        datetimes_pd = pd.to_datetime(datetimes)

        target_data = []

        for i in range(len(datetimes_pd)):  # Safety check
            try:
                step_data = selected_data.isel(step=i).values
                target_data.append(step_data)
            except OSError:
                target_data.append(np.nan)

        target_df = pd.DataFrame()

        # --------------------------------------------------------------------------------------------------------------
        # Turning cumulative to incremental
        # --------------------------------------------------------------------------------------------------------------

        target_df['var'] = pd.to_numeric(target_data, errors='coerce')
        target_df["GHI"] = target_df["var"].diff()
        del target_df["var"]

        # --------------------------------------------------------------------------------------------------------------
        # Converting units
        # --------------------------------------------------------------------------------------------------------------

        target_df["GHI"] = target_df["GHI"].values/3600

        # --------------------------------------------------------------------------------------------------------------
        # Setting timestamps as the index
        # --------------------------------------------------------------------------------------------------------------

        target_df.index = datetimes_pd

        target_df.to_csv("/output/target_{}.csv".format(variable_name), index=False)

        return target_df

    elif variable_name == 'aod550':

        a = []

        for i in range(ds.aod550.values.shape[0]):

            # Extract the 4 closest grid points
            list_values = [ds.aod550.values[i][0][0], ds.aod550.values[i][0][1],
                           ds.aod550.values[i][1][0], ds.aod550.values[i][1][1]]

            # Use median for robustness
            mdn = statistics.median(list_values)
            a.append(mdn)

        return a


# ----------------------------------------------------------------------------------------------------------------------
# AOD Correction
# ----------------------------------------------------------------------------------------------------------------------


def apply_aod_correction_based_on_beer_law(a, df):

    # Fallback to simple correction using Beer's law
    transmission = np.exp(-np.array(a))

    # Make sure arrays are the same length for the correction
    if len(transmission) < len(df):
        # Pad with 1.0 (no correction) if needed
        transmission = np.pad(transmission, (0, len(df) - len(transmission)), 'constant',
                              constant_values=1.0)
    elif len(transmission) > len(df):
        transmission = transmission[:len(df)]

    # Apply the correction to the radiation value
    df_corrected = df.copy()
    if 'var' in df_corrected.columns:
        df_corrected['var'] = df['var'].values * transmission
    else:
        # If the column name is different, apply to the first column
        df_corrected.iloc[:, 0] = df.iloc[:, 0].values * transmission

    return df


# ----------------------------------------------------------------------------------------------------------------------
# BRL Model
# ----------------------------------------------------------------------------------------------------------------------


class BRLModel:

    def __init__(
            self,
            hourly_clearness,
            lat,
            lon,
            parameters='lauret',
            daily_clearness=None
    ):

        self.hourly_clearness = hourly_clearness
        self.daily_clearness = daily_clearness
        self.lat = lat
        self.lon = lon

        # Initializing parameters
        self.parameters = parameters
        if self.parameters == 'lauret':
            # Updated params from Lauret et al. (2013)
            self.DEFAULT_PARAMS = {
                "a0": -5.32,
                "a1": 7.28,
                "b1": -0.03,
                "b2": -0.0047,
                "b3": 1.72,
                "b4": 1.08,
            }

        elif self.parameters == 'ridley':
            # Parameters from Ridley et al. (2010)
            self.DEFAULT_PARAMS = {
                'a0': -5.38,
                'a1': 6.63,
                'b1': 0.006,
                'b2': -0.007,
                'b3': 1.75,
                'b4': 1.31
            }

    def run(self):

        rise_set_times = sun_rise_set_times(self.hourly_clearness.index, (self.lat, self.lon))

        obs = ephem.Observer()
        obs.lat = str(self.lat)
        obs.lon = str(self.lon)

        diffuse_fractions = []

        # Iterating over
        for i in range(0, len(self.hourly_clearness), 24):

            # for entry in list in hourly clearness indices:
            ks = self.hourly_clearness.iloc[i: i + 24].tolist()

            # Daily clearness index
            if self.daily_clearness is not None:
                kd = self.daily_clearness.iloc[i//24]
            else:
                kd = None

            obs.date = self.hourly_clearness.index[i]

            # These are indexed by day, so need to scale the index
            sunrise, sunset = rise_set_times[int(i / 24)]

            results = _daily_diffuse(obs, ks, kd, sunrise, sunset, self.DEFAULT_PARAMS)

            # The extend() method adds the specified list elements (or any iterable) to the end of the current list.
            diffuse_fractions.extend(results)

        return pd.Series(diffuse_fractions, index=self.hourly_clearness.index)

# ----------------------------------------------------------------------------------------------------------------------
# PVPanel
# ----------------------------------------------------------------------------------------------------------------------


R_TAMB = 20  # Reference ambient temperature (degC)
R_TMOD = 25  # Reference module temperature (degC)
R_IRRADIANCE = 1000  # Reference irradiance (W/m2)
R_WINDSPEED = 5  # Reference wind speed (m/2)


class PVPanel(object):
    """
    PV panel model class

    Unit for power is W, for energy, Wh.

    By default, self.module_aperture is set to 1.0, so the output will
    correspond to output per m2 of solar field given the other
    input values.

    Parameters
    ----------
    panel_aperture : float
        Panel aperture area (m2)
    panel_ref_efficiency : float
        Reference conversion efficiency
    """

    def __init__(self, panel_aperture=1.0, panel_ref_efficiency=1.0):
        super().__init__()
        # Panel characteristics
        self.panel_aperture = panel_aperture
        self.panel_ref_efficiency = panel_ref_efficiency

    def panel_power(self, irradiance, tamb=None):
        """
        Returns electricity in W from PV panel(s) based on given input data.

        Parameters
        ----------
        irradiance : pandas Series
            Incident irradiance hitting the panel(s) in W/m2.
        tamb : pandas Series, default None
            Ambient temperature in deg C. If not given, R_TAMB is used
            for all values.

        """
        if tamb is not None:
            assert irradiance.index.equals(tamb.index), "Data indices must match"
        return (
            irradiance
            * self.panel_aperture
            * self.panel_relative_efficiency(irradiance, tamb)
            * self.panel_ref_efficiency
        )

    def panel_relative_efficiency(self, irradiance, tamb):
        raise NotImplementedError(
            "Must subclass and specify relative efficiency function"
        )


class SingleDiodePanel(PVPanel):
    """
    PV panel model using `pvlib.pvsystem.calcparams_desoto` and
    `pvlib.pvsystem.singlediode`.

    module_params : dict
        Module parameters 'alpha_sc', 'a_ref', 'I_L_ref', 'I_o_ref',
        'R_sh_ref', 'R_s'.
    temperature_params : dict or str
        If dict: must contain the keys "a", "b", "delta_tau"
        If str: one of "open_rack_glass_glass", "close_mount_glass_glass",
        "open_rack_glass_polymer", "insulated_back_glass_polymer"
    ref_windspeed : float, default 5
        Reference wind speed (m/2).

    """

    def __init__(
        self,
        module_params,
        temperature_params="open_rack_glass_glass",
        ref_windspeed=R_WINDSPEED,
        **kwargs,
    ):
        super().__init__(**kwargs)
        # Some very simple checking of inputs
        for k in ["alpha_sc", "a_ref", "I_L_ref", "I_o_ref", "R_sh_ref", "R_s"]:
            assert k in module_params
        self.module_params = module_params
        self.temperature_params = temperature_params
        self.ref_windspeed = ref_windspeed

    def panel_relative_efficiency(self, irradiance, tamb, windspeed=None):
        """
        Returns the relative conversion efficiency modifier as a
        function of irradiance and ambient temperature.

        All parameters can be either float or pandas.Series.

        """
        if windspeed is None:
            windspeed = self.ref_windspeed
        if isinstance(self.temperature_params, str):
            self.temperature_params = pvlib.temperature.TEMPERATURE_MODEL_PARAMETERS[
                "sapm"
            ][self.temperature_params]

        a = self.temperature_params["a"]
        b = self.temperature_params["b"]
        delta_tau = self.temperature_params["delta_tau"]

        cell_temperature = pvlib.temperature.sapm_cell(
            irradiance, tamb, windspeed, a, b, delta_tau
        )

        efficiency = relative_eff(
            irradiance, cell_temperature, self.module_params
        )

        return efficiency


class HuldPanel(PVPanel):
    """
    Parametric PV panel model from Huld et al., 2010 {1}.

    c_temp_amb: float, default 1 degC / degC
        Panel temperature coefficient of ambient temperature
    c_temp_irrad: float, default 0.035 degC / (W/m2)
        Panel temperature coefficient of irradiance. According to {1},
        reasonable values for this for c-Si are:
            0.035  # Free-standing module, assuming no wind
            0.05   # Building-integrated module

    """

    # Huld model coefficients, set in subclasses
    k_1: float
    k_2: float
    k_3: float
    k_4: float
    k_5: float
    k_6: float

    def __init__(self, c_temp_amb=1, c_temp_irrad=0.035, **kwargs):
        super().__init__(**kwargs)
        # Panel temperature estimation
        self.c_temp_tamb = c_temp_amb
        self.c_temp_irrad = c_temp_irrad

    def panel_relative_efficiency(self, irradiance, tamb):
        """
        Returns the relative conversion efficiency modifier as a
        function of irradiance and ambient temperature.

        Source: {1}

        Parameters
        ----------
        irradiance : pandas Series
            Irradiance in W
        tamb : pandas Series
            Ambient temperature in deg C

        """
        # G_: normalized in-plane irradiance
        G_ = irradiance / R_IRRADIANCE
        # T_: normalized module temperature
        T_ = (self.c_temp_tamb * tamb + self.c_temp_irrad * irradiance) - R_TMOD
        # NB: np.log without base implies base e or ln
        # Catching warnings to suppress "RuntimeWarning: invalid value encountered in log"
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            eff = (
                1
                + self.k_1 * np.log(G_)
                + self.k_2 * (np.log(G_)) ** 2
                + T_ * (self.k_3 + self.k_4 * np.log(G_) + self.k_5 * (np.log(G_)) ** 2)
                + self.k_6 * (T_ ** 2)
            )
        eff.fillna(0, inplace=True)  # NaNs in case that G_ was <= 0
        eff[eff < 0] = 0  # Also make sure efficiency can't be negative
        return eff


class HuldCSiPanel(HuldPanel):
    """c-Si technology, based on data from {1}"""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.k_1 = -0.017162
        self.k_2 = -0.040289
        self.k_3 = -0.004681
        self.k_4 = 0.000148
        self.k_5 = 0.000169
        self.k_6 = 0.000005


class HuldCISPanel(HuldPanel):
    """CIS technology, based on data from {1}"""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.k_1 = -0.005521
        self.k_2 = -0.038492
        self.k_3 = -0.003701
        self.k_4 = -0.000899
        self.k_5 = -0.001248
        self.k_6 = 0.000001


class HuldCdTePanel(HuldPanel):
    """CdTe technology, based on data from {1}"""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.k_1 = -0.103251
        self.k_2 = -0.040446
        self.k_3 = -0.001667
        self.k_4 = -0.002075
        self.k_5 = -0.001445
        self.k_6 = -0.000023


_PANEL_TYPES = {
    "csi": HuldCSiPanel,
    "cis": HuldCISPanel,
    "cdte": HuldCdTePanel,
    "singlediode": SingleDiodePanel,
}


class Inverter(object):
    """
    PV inverter curve from {2}.

    By default, we assume that nominal DC-to-AC efficiency
    is 1.0, so that AC and DC nameplate capacities are equal.

    """

    def __init__(self, ac_capacity, eff_ref=0.9637, eff_nom=1.0):
        super().__init__()
        self.ac_capacity = ac_capacity
        self.dc_capacity = ac_capacity / eff_nom
        self.efficiency_term = eff_nom / eff_ref

    def ac_output(self, dc_in):
        """
        Parameters
        ----------
        dc_in : float
            DC electricity input in W

        Returns
        -------
        ac_output : float
            AC electricity output in W

        """
        if dc_in == 0:
            return 0
        else:
            zeta = dc_in / self.dc_capacity
            eff = self.efficiency_term * (-0.0162 * zeta - 0.0059 / zeta + 0.9858)
            return min(self.ac_capacity, dc_in * eff)


def run_model(
    data,
    coords,
    tilt,
    azim,
    tracking,
    capacity,
    inverter_capacity=None,
    use_inverter=True,
    technology="csi",
    system_loss=0,
    angles=None,
    include_raw_data=False,
    **kwargs,
):
    """
    Run PV plant model.

    Parameters
    ----------
    data : pandas DataFrame
        Must contain columns 'global_horizontal' (in W/m2)
        and 'diffuse_fraction', and may contain a 'temperature' column
        for ambient air temperature (in deg C).
    coords : (float, float) tuple
        Latitude and longitude.
    tilt : float
        Tilt angle (degrees).
    azim : float
        Azimuth angle (degrees, 180 = towards equator).
    tracking : int
        Tracking (0: none, 1: 1-axis, 2: 2-axis).
    capacity : float
        Installed DC panel capacity in W.
    inverter_capacity : float, optional
        Installed AC inverter capacity in W. If not given, the DC panel
        capacity is assumed to be equal to AC inverter capacity.
    use_inverter : bool, optional
        Model inverter capacity and inverter losses (defaults to True).
    technology : str, default 'csi'
        Panel technology, must be one of 'csi', 'cis', 'cdte', 'singlediode'
    system_loss : float, default 0.10
        Additional system losses not caused by panel and inverter (fraction).
    angles : pandas DataFrame, default None
        Solar angles. If already computed, speeds up the computations.
    include_raw_data : bool, default False
        If true, returns a DataFrame instead of Series which includes
        the input data (panel irradiance and temperature).
    kwargs : additional kwargs passed on the model constructor

    Returns
    -------
    result : pandas Series
        Electric output from PV system in each hour (W).

    """
    if (system_loss < 0) or (system_loss > 1):
        raise ValueError("system_loss must be >=0 and <=1")

    # Process data
    dir_horiz = data.global_horizontal * (1 - data.diffuse_fraction)
    diff_horiz = data.global_horizontal * data.diffuse_fraction

    # NB: aperture_irradiance expects azim/tilt in radians!
    irrad = aperture_irradiance(
        dir_horiz,
        diff_horiz,
        coords,
        tracking=tracking,
        azimuth=math.radians(azim),
        tilt=math.radians(tilt),
        angles=angles,
    )

    datetimes = irrad.index

    # Temperature, if it was given
    if "temperature" in data.columns:
        tamb = data["temperature"]
    else:
        tamb = pd.Series(R_TAMB, index=datetimes)

    # Set up the panel model
    # NB: panel efficiency is not used here, but we retain the possibility
    # to adjust both efficiency and panel size in case we want to emulate
    # specific panel types
    panel_class = _PANEL_TYPES[technology]
    panel_efficiency = 0.153
    area_per_capacity = 0.001 / panel_efficiency

    panel = panel_class(
        panel_aperture=capacity * area_per_capacity,
        panel_ref_efficiency=panel_efficiency,
        **kwargs,
    )

    # Run the panel model and return output
    irradiance = irrad.direct + irrad.diffuse
    output = panel.panel_power(irradiance, tamb)
    dc_out = pd.Series(output, index=datetimes).clip(upper=capacity)

    if inverter_capacity is None:
        inverter_capacity = capacity

    if use_inverter:
        inverter = Inverter(inverter_capacity)
        ac_out = dc_out.apply(inverter.ac_output).clip(lower=0)
        ac_out_final = ac_out * (1 - system_loss)
    else:
        ac_out_final = dc_out * (1 - system_loss)

    if include_raw_data:
        return pd.DataFrame.from_dict(
            {
                "output": ac_out_final,
                "direct": irrad.direct,
                "diffuse": irrad.diffuse,
                "temperature": tamb,
            }
        )
    else:
        return ac_out_final


# ----------------------------------------------------------------------------------------------------------------------
# Other helpful functions
# ----------------------------------------------------------------------------------------------------------------------

def _get_rise_and_set_time(date, sun, obs):
    """
    Returns a tuple of (rise, set) time for the given date, sun and observer.
    """
    obs.date = date
    sun.compute(obs)

    # Up to and including v0.2.1, old API was implicitly setting use_center
    # to True, but considering the sun's radius leads to slightly more
    # realistic rise/set time
    try:
        rising = obs.next_rising(sun, use_center=False)
    except (ephem.AlwaysUpError, ephem.NeverUpError):
        rising = None

    try:
        setting = obs.next_setting(sun, use_center=False)
    except (ephem.AlwaysUpError, ephem.NeverUpError):
        setting = None

    rise_time = None if not rising else rising.datetime()
    set_time = None if not setting else setting.datetime()

    return rise_time, set_time


def sun_rise_set_times(datetime_index, coords):
    """
    Returns sunrise and set times for the given datetime_index and coords,
    as a Series indexed by date (days, resampled from the datetime_index).

    """
    sun = ephem.Sun()
    obs = ephem.Observer()
    obs.lat = str(coords[0])
    obs.lon = str(coords[1])

    # Ensure datetime_index is daily
    dtindex = pd.DatetimeIndex(
        datetime_index.to_series().map(pd.Timestamp.date).unique()
    )

    return pd.Series(
        [_get_rise_and_set_time(i, sun, obs) for i in dtindex], index=dtindex
    )


def sun_angles(datetime_index, coords, rise_set_times=None):
    """
    Calculates sun angles. Returns a dataframe containing `sun_alt`,
    `sun_zenith`, `sun_azimuth` and `duration` over the passed datetime index.

    Parameters
    ----------
    datetime_index : pandas datetime index
        Handled as if they were UTC not matter what timezone info
        they may supply.
    coords : (float, float) or (int, int) tuple
        Latitude and longitude.
    rise_set_times : list, default None
        List of (sunrise, sunset) time tuples, if not passed, is computed
        here.

    """

    def _sun_alt_azim(sun, obs):
        sun.compute(obs)
        return sun.alt, sun.az

    # Initialize ephem objects
    obs = ephem.Observer()
    obs.lat = str(coords[0])
    obs.lon = str(coords[1])
    sun = ephem.Sun()

    # Calculate daily sunrise/sunset times
    if rise_set_times is None:
        rise_set_times = sun_rise_set_times(datetime_index, coords)

    # Calculate hourly altitute, azimuth, and sunshine
    alts = []
    azims = []
    durations = []

    for index, item in enumerate(datetime_index):
        obs.date = item
        # rise/set times are indexed by day, so need to adjust lookup
        rise_time, set_time = rise_set_times.loc[pd.Timestamp(item.date())]

        # Set angles, sun altitude and duration based on hour of day:
        if rise_time is not None and item.hour == rise_time.hour:
            # Special case for sunrise hour
            duration = 60 - rise_time.minute - (rise_time.second / 60.0)
            obs.date = rise_time + timedelta(minutes=duration / 2)
            sun_alt, sun_azimuth = _sun_alt_azim(sun, obs)
        elif set_time is not None and item.hour == set_time.hour:
            # Special case for sunset hour
            duration = set_time.minute + set_time.second / 60.0
            obs.date = item + timedelta(minutes=duration / 2)
            sun_alt, sun_azimuth = _sun_alt_azim(sun, obs)
        else:
            # All other hours
            duration = 60
            obs.date = item + timedelta(minutes=30)
            sun_alt, sun_azimuth = _sun_alt_azim(sun, obs)
            if sun_alt < 0:  # If sun is below horizon
                sun_alt, sun_azimuth, duration = 0, 0, 0

        alts.append(sun_alt)
        azims.append(sun_azimuth)
        durations.append(duration)
    df = pd.DataFrame(
        {"sun_alt": alts, "sun_azimuth": azims, "duration": durations},
        index=datetime_index,
    )
    df["sun_zenith"] = (np.pi / 2) - df.sun_alt
    # Sun altitude considered zero if slightly below horizon
    df["sun_alt"] = df["sun_alt"].clip(lower=0)
    return df


def _incidence_fixed(sun_alt, tilt, azimuth, sun_azimuth):
    """Returns incidence angle for a fixed panel"""
    return np.arccos(
        np.sin(sun_alt) * np.cos(tilt)
        + np.cos(sun_alt) * np.sin(tilt) * np.cos(azimuth - sun_azimuth)
    )


def _incidence_single_tracking(sun_alt, tilt, azimuth, sun_azimuth):
    """
    Returns incidence angle for a 1-axis tracking panel

    Parameters
    ----------
    sun_alt : sun altitude angle
    tilt : tilt of tilt axis
    azimuth : rotation of tilt axis
    sun_azimuth : sun azimuth angle

    """
    if tilt == 0:
        return np.arccos(
            np.sqrt(1 - np.cos(sun_alt) ** 2 * np.cos(sun_azimuth - azimuth) ** 2)
        )
    else:
        return np.arccos(
            np.sqrt(
                1
                - (
                    np.cos(sun_alt + tilt)
                    - np.cos(tilt)
                    * np.cos(sun_alt)
                    * (1 - np.cos(sun_azimuth - azimuth))
                )
                ** 2
            )
        )


def _tilt_single_tracking(sun_alt, tilt, azimuth, sun_azimuth):
    """
    Returns panel tilt angle for a 1-axis tracking panel

    Parameters
    ----------
    sun_alt : sun altitude angle
    tilt : tilt of tilt axis
    azimuth : rotation of tilt axis
    sun_azimuth : sun azimuth angle

    """
    if tilt == 0:
        return np.arctan(np.sin(sun_azimuth - azimuth) / np.tan(sun_alt))
    else:
        return np.arctan(
            (np.cos(sun_alt) * np.sin(sun_azimuth - azimuth))
            / (
                np.sin(sun_alt - tilt)
                + np.sin(tilt) * np.cos(sun_alt) * (1 - np.cos(sun_azimuth - azimuth))
            )
        )


def aperture_irradiance(
    direct,
    diffuse,
    coords,
    tilt=0,
    azimuth=0,
    tracking=0,
    albedo=0.3,
    dni_only=False,
    angles=None,
):
    """
    Parameters
    ----------

    direct : pandas.Series
        Direct horizontal irradiance with a datetime index
    diffuse : pandas.Series
        Diffuse horizontal irradiance with the same datetime index as `direct`
    coords : (float, float)
        (lat, lon) tuple of location coordinates
    tilt : float, default=0
        Angle of panel relative to the horizontal plane.
        0 = flat.
    azimuth : float, default=0
        Deviation of the tilt direction from the meridian.
        0 = towards pole, going clockwise, 3.14 = towards equator.
    tracking : int, default=0
        0 (none, default), 1 (tilt), or 2 (tilt and azimuth).
        If 1, `tilt` gives the tilt of the tilt axis relative to horizontal
        (tilt=0) and `azimuth` gives the orientation of the tilt axis.
    albedo : float, default=0.3
        reflectance of the surrounding surface
    dni_only : bool, default False
        only calculate and directly return a DNI time series (ignores
        tilt, azimuth, tracking and albedo arguments).
    angles : pandas.DataFrame, optional
        Solar angles. If default (None), they are computed automatically.

    """
    # 0. Correct azimuth if we're on southern hemisphere, so that 3.14
    # points north instead of south
    if coords[0] < 0:
        azimuth = azimuth + np.pi
    # 1. Calculate solar angles
    if angles is None:
        sunrise_set_times = sun_rise_set_times(direct.index, coords)
        angles = sun_angles(direct.index, coords, sunrise_set_times)
    # 2. Calculate direct normal irradiance
    dni = (direct * (angles["duration"] / 60)) / np.cos(angles["sun_zenith"])
    if dni_only:
        return dni
    # 3. Calculate appropriate aperture incidence angle
    if tracking == 0:
        incidence = _incidence_fixed(
            angles["sun_alt"], tilt, azimuth, angles["sun_azimuth"]
        )
        panel_tilt = tilt
    elif tracking == 1:
        # 1-axis tracking with horizontal or tilted tracking axis
        incidence = _incidence_single_tracking(
            angles["sun_alt"], tilt, azimuth, angles["sun_azimuth"]
        )
        panel_tilt = _tilt_single_tracking(
            angles["sun_alt"], tilt, azimuth, angles["sun_azimuth"]
        )
    elif tracking == 2:
        # 2-axis tracking means incidence angle is zero
        # Assuming azimuth/elevation tracking for tilt/azimuth angles
        incidence = 0
        panel_tilt = angles["sun_zenith"]
        azimuth = angles["sun_azimuth"]
    else:
        raise ValueError("Invalid setting for tracking: {}".format(tracking))
    # 4. Compute direct and diffuse irradiance on plane
    # Clipping ensures that very low panel to sun altitude angles do not
    # result in negative direct irradiance (reflection)
    plane_direct = (dni * np.cos(incidence)).fillna(0).clip(lower=0)
    plane_diffuse = (
        diffuse * ((1 + np.cos(panel_tilt)) / 2)
        + albedo * (direct + diffuse) * ((1 - np.cos(panel_tilt)) / 2)
    ).fillna(0)
    return pd.DataFrame({"direct": plane_direct, "diffuse": plane_diffuse})


def _solartime(observer, sun):
    """Return solar time for given observer and sun"""
    # sidereal time == ra (right ascension) is the highest point (noon)
    hour_angle = observer.sidereal_time() - sun.ra
    return ephem.hours(hour_angle + ephem.hours("12:00")).norm  # norm for 24h


def _get_psi_func(sunrise, sunset):
    """
    Return a function, psi(hour, ks), for the given sunrise and
    sunset times

    """
    try:
        sunrise_hour = sunrise.hour
    except AttributeError:
        sunrise_hour = 0
    try:
        sunset_hour = sunset.hour
    except AttributeError:
        sunset_hour = 23

    def f(hour, ks):
        if (hour > sunrise_hour) and (hour < sunset_hour):
            psi = (ks[hour - 1] + ks[hour + 1]) / 2
            # Extra check: in some cases there is no data in `ks` even before
            # sunset / afer sunrise. For example, if the sun sets just minutes
            # after the hour, there may be no irradiance data in that hour.
            # This if-clause ensures that for practical reasons such cases
            # are treated as if they were sunrise/sunset hours.
            if np.isnan(psi):
                if np.isnan(ks[hour - 1]):
                    psi = ks[hour + 1]
                else:
                    psi = ks[hour - 1]
        elif hour == sunrise_hour:
            try:
                psi = ks[hour + 1]
            except IndexError:
                psi = ks[hour]
        elif hour == sunset_hour:
            try:
                psi = ks[hour - 1]
            except IndexError:
                psi = ks[hour]
        else:
            psi = 0
        return psi

    return f


def get_efficiency(irradiance, cell_temperature, module_params):
    """
    irradiance : float or pandas.Series
        Effective irradiance (W/m2) that is converted to photocurrent.
    cell_temperature : float or pandas.Series
        Average cell temperature of cells within a module in deg C.
    module_params : dict
        Module params 'alpha_sc', 'a_ref', 'I_L_ref', 'I_o_ref', 'R_sh_ref', 'R_s'.

    """
    params = pvlib.pvsystem.calcparams_desoto(
        effective_irradiance=irradiance, temp_cell=cell_temperature, **module_params
    )

    # Ensure that the shunt resistance is not infinite
    # Commented out because we want to still return valid Series when
    # some of the values are zero -- NaNs from 0-divisions are filled later
    # assert params[3] != math.inf

    dc = pvlib.pvsystem.singlediode(*params)
    efficiency = dc["p_mp"] / irradiance
    return efficiency


def relative_eff(irradiance, cell_temperature, params):
    """
    Compute relative efficiency of PV module as a function of irradiance
    and cell/module temperature, from Huld (2010):

    .. math:: n_{rel} = \frac{P_{stc} * (G / G_{stc})}{P}

    Where G is in-plane irradiance, P is power output,
    and STC conditions are :math:`G = 1000` and
    :math:`T_{mod} = 25`.

    When irradiance is zero, a zero relative efficiency is returned.

    Parameters
    ----------

    irradiance : float or pandas.Series
        Irradiance in W/m2.
    cell_temperature : float or pandas.Series
        Average cell temperature of cells within a module in deg C.
    params : dict
        Module params 'alpha_sc', 'a_ref', 'I_L_ref', 'I_o_ref', 'R_sh_ref', 'R_s'.

    """
    if isinstance(irradiance, float) and irradiance == 0:
        return 0

    power_stc = 1000 * get_efficiency(1000, 25, params)
    power = irradiance * get_efficiency(irradiance, cell_temperature, params)

    # Fill NaNs from any possible divisions by zero with 0
    return (power / (power_stc * (irradiance / 1000))).fillna(0)


def _daily_diffuse(obs, ks, k_day, sunrise, sunset, p):
    """
    Returns a list of diffuse fractions for the given observer
    which must have its coordinates and date set, and given the ``ks``,
    a list of 24 hourly clearness indices, and sunrise and sunset times.

    """
    date = obs.date.datetime()
    # whether date was set or not, ensure it's at hour 0
    obs.date = datetime(date.year, date.month, date.day)
    sun = ephem.Sun()
    sun.compute(obs)
    # sunrise, sunset = _sunrise_sunset(obs, sun)
    alpha = sun.alt
    values = []

    if k_day is None:
        k_day = pd.Series(ks).mean()  # using pandas to ignore NaN

    psi = _get_psi_func(sunrise, sunset)
    for hour in range(24):
        if np.isnan(ks[hour]):
            d = np.nan
        else:
            ast = _solartime(obs, sun)
            pwr = (
                    p["a0"]
                    + p["a1"] * ks[hour]
                    + p["b1"] * ast
                    + p["b2"] * alpha
                    + p["b3"] * k_day
                    + p["b4"] * psi(hour, ks)
            )
            d = 1 / (1 + math.e ** pwr)
        values.append(d)
        # Increase obs.date by one hour for the next iteration
        obs.date = obs.date.datetime() + timedelta(hours=1)
        sun.compute(obs)
    return values


def date_to_doy(date_str):
    """
    A function for converting a date string to the Day of the Year (DOY).

    Parameters:
    date_str (str): Date string in the format 'YYYY-MM-DD'.

    Returns:
    int: Day of the Year.
    """

    date_format = "%Y-%m-%d"
    date = datetime.strptime(date_str, date_format)
    doy = date.timetuple().tm_yday
    return doy


def doy_to_mean_anomaly(doy):
    """

    :param doy:
    :return:
    """
    return 2*math.pi*(doy-1)/365


def da_to_re(da):

    """

    :param da:
    :return:
    """
    re = 1.000110+0.034221*math.cos(da)+0.001280*math.sin(da)+0.00719*math.cos(2*da)+0.000077*math.sin(2*da)
    return re


def seasonal_profile_dict_from_series(my_series: pd.Series) -> dict:
    """
    Given a pandas Series with a DatetimeIndex, returns a dict mapping
    the 3-letter month abbreviation ('Jan', 'Feb', …) to the average
    summed value of the series in that calendar month (across all years).
    """
    # 1. Build a DataFrame with the raw values and month tags
    df = my_series.to_frame(name='value')
    df['month_year'] = df.index.strftime('%m%Y')  # e.g. "052004"
    df['month'] = df.index.month            # integer 1–12

    # 2. Sum within each month_year
    temp_df = (
        df
        .groupby('month_year')['value']
        .sum()
        .reset_index()
    )
    # Re-extract month number in case some months are missing in the series
    temp_df['month'] = temp_df['month_year'].str[:2].astype(int)

    # 3. Compute the mean of those sums for each calendar month
    intra_annual_mean = (
        temp_df
        .groupby('month')['value']
        .mean()
        .reset_index()
    )

    # 4. Build and return the dict with 3-letter month keys
    return {
        calendar.month_abbr[int(row['month'])]: float(row['value'])
        for _, row in intra_annual_mean.iterrows()
    }
