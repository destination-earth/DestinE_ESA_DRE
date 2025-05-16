import json
import os
import sys
import argparse
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import requests
from lxml import html
import earthkit.data

# Authentication constants
IAM_URL = "https://auth.destine.eu"
CLIENT_ID = "polytope-api-public"
REALM = "desp"
SERVICE_URL = "https://polytope.lumi.apps.dte.destination-earth.eu/"

# Configure paths
DATA_DIR = Path("./data")
CONFIG_DIR = Path("./config")

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
CONFIG_DIR.mkdir(exist_ok=True)

# Default token path
token_env_path = os.environ.get("POLYTOPE_RCFILE")
if token_env_path:
    TOKEN_PATH = Path(token_env_path)
else:
    TOKEN_PATH = CONFIG_DIR / ".polytopeapirc"

#TOKEN_PATH = Path.home() / ".polytopeapirc"
#TOKEN_PATH = CONFIG_DIR / ".polytopeapirc"


def authenticate():
    """Authenticates with DESP and saves the token"""
    
    username = os.environ.get("DESP_USERNAME")
    password = os.environ.get("DESP_PASSWORD")
    
    if not username or not password:
        raise ValueError("DESP_USERNAME and DESP_PASSWORD must be set as environment variables")
    
    print(f"Authenticating with username: {username}")
    
    with requests.Session() as s:
        # Get the auth url
        auth_url = (
            html.fromstring(
                s.get(
                    url=IAM_URL + "/realms/" + REALM + "/protocol/openid-connect/auth",
                    params={
                        "client_id": CLIENT_ID,
                        "redirect_uri": SERVICE_URL,
                        "scope": "openid offline_access",
                        "response_type": "code",
                    },
                ).content.decode()
            )
            .forms[0]
            .action
        )

        # Login and get auth code
        login = s.post(
            auth_url,
            data={
                "username": username,
                "password": password,
            },
            allow_redirects=False,
        )

        # Check for errors
        if login.status_code == 200:
            tree = html.fromstring(login.content)
            error_message_element = tree.xpath('//span[@id="input-error"]/text()')
            error_message = error_message_element[0].strip() if error_message_element else "Login failed"
            raise Exception(error_message)

        if login.status_code != 302:
            raise Exception("Login failed")

        auth_code = parse_qs(urlparse(login.headers["Location"]).query)["code"][0]

        # Use the auth code to get the token
        response = requests.post(
            IAM_URL + "/realms/" + REALM + "/protocol/openid-connect/token",
            data={
                "client_id": CLIENT_ID,
                "redirect_uri": SERVICE_URL,
                "code": auth_code,
                "grant_type": "authorization_code",
                "scope": "",
            },
        )

        if response.status_code != 200:
            raise Exception("Failed to get token")

        # Save the refresh token
        token = response.json()["refresh_token"]
        
        # Save token to file
        with open(TOKEN_PATH, "w") as file:
            json.dump({"user_key": token}, file)
            print(f"Token successfully written to {TOKEN_PATH}")
            
        # Also save to home directory for compatibility
        home_token = Path.home() / ".polytopeapirc"
        with open(home_token, "w") as file:
            json.dump({"user_key": token}, file)
            print(f"Token also written to {home_token}")
        
        return TOKEN_PATH


def download_data(date, param, forecast_horizon):
    """Download data from Polytope"""
    try:
        print(f"Processing download request")
        
        # Make sure we're authenticated
        if not TOKEN_PATH.exists():
            print("Token not found - authenticating...")
            authenticate()
        
        # Set environment variable to ensure earthkit can find the token
        os.environ["POLYTOPE_RCFILE"] = str(TOKEN_PATH)
        print(f"Set POLYTOPE_RCFILE to {os.environ['POLYTOPE_RCFILE']}")
        
        # Extract date components
        year = date[0:4]
        month = date[4:6]
        day = date[6:8]
        
        # Construct step parameter based on the param
        if param == 169:
            # For param 169, use the original step format
            #step = "/".join(f"{i}-{i+1}" for i in range(48))
            step = f"0-1/to/{forecast_horizon-1}-{forecast_horizon}/by/1"
        else:
            # For other params, use the simplified format
            step = f"0/to/{forecast_horizon}/by/1"
            
        print(f"Using step format: {step}")
        
        # Construct the data request
        request = {
            "class": "d1",
            "expver": "0001",
            "dataset": "extremes-dt",
            "stream": "oper",
            "date": date,
            "time": "0000",
            "type": "fc",
            "levtype": "sfc",
            "step": step,
            "param": str(param),
        }
        
        print(f"Requesting data with parameters: {request}")
        
        # Construct the filename
        filename = f"{param}_{year}_{month}_{day}.grib"
        file_path = DATA_DIR / filename
        
        print(f"Will save file to: {file_path}")
        
        # Download data
        data = earthkit.data.from_source(
            "polytope", 
            "destination-earth", 
            request,
            address="polytope.lumi.apps.dte.destination-earth.eu",
            stream=False
        )
        
        print("Download complete")
        
        # Save the GRIB file
        data.save(file_path)
        print(f"File saved to {file_path}")
        
        # Get actual file size in bytes
        file_size = os.path.getsize(file_path)
        print(f"File size: {file_size} bytes")
        
        # Open and read the GRIB data for validation
        #grib_data = cfgrib.open_dataset(file_path)
        #print(f"Successfully validated GRIB data")
        
        print(f"Download completed successfully")
        return True
            
    except Exception as e:
        error_message = str(e)
        print(f"Error downloading data: {error_message}")
        return False


def main():
    """Main function to parse arguments and execute download"""
    # Get today's date as the default
    today = datetime.now().strftime("%Y%m%d")
    
    parser = argparse.ArgumentParser(description='Download data from Polytope')
    parser.add_argument('--date', default=today, help=f'Date in YYYYMMDD format (default: {today})')
    parser.add_argument('--param', type=str, default="169", help='Parameter ID(s), e.g. "169" or "165/166/134"')
    #parser.add_argument('--param', type=int, default=169, help='Parameter ID (default: 169)')
    parser.add_argument('--forecast-horizon', type=int, default=48, 
                        help='Forecast horizon in hours (default: 48)')
    
    args = parser.parse_args()
    
    # Check date format
    if not (len(args.date) == 8 and args.date.isdigit()):
        print("Error: Date must be in YYYYMMDD format")
        sys.exit(1)
    
    params = set(args.param.split('/'))
    print(f"Parameters to download: {params}")
    #sys.exit(0)


    # Check first if file exists - no need to authenticate if we're going to skip
    year = args.date[0:4]
    month = args.date[4:6]
    day = args.date[6:8]

    new_params = set(args.param.split('/'))
    for param in params:
        # Construct the filename
        filename = f"{param}_{year}_{month}_{day}.grib"
        file_path = DATA_DIR / filename
        
        if file_path.exists():
            file_size = os.path.getsize(file_path)
            file_size_gb = file_size / (1024 ** 3)
            if file_size_gb > 2:
                new_params.remove(param)
                print(f"File {filename} already exists with size {file_size_gb:.2f} GB.")
                print(f"Skipping download for param {param}. Use a different filename or remove the existing file to download again.")
    if not new_params:
        print("All requested files already exist and are larger than 2 GB. No download needed.")
        sys.exit(0)
    else:
        params = new_params
        print(f"Parameters to download: {params}")
    #filename = f"{args.param}_{year}_{month}_{day}.grib"
    

    #authenticate()
    print("Starting authentication process...")
    # Try to authenticate if needed
    try:
        if not TOKEN_PATH.exists():
            authenticate()
    except Exception as e:
        print(f"Authentication failed: {str(e)}")
        sys.exit(1)
    
    # Download data
  
    print(f"Parameters to download: {params}")
    all_success = True
    for param in params:
        success = download_data(
            args.date,
            int(param),
            args.forecast_horizon
        )
        if not success:
            all_success = False
 
    # Exit with appropriate code
    sys.exit(0 if all_success else 1)



if __name__ == "__main__":
    main()