import requests
import sys
import os
import time
import json
import urllib.parse

def main():
    # Parse command line arguments
    if len(sys.argv) != 5:
        print("Usage: python hda_cams.py <longitude> <latitude> <altitude> <date_range>")
        print("  date_range format: YYYY-MM-DD or YYYY-MM-DD/YYYY-MM-DD for a range")
        sys.exit(1)
    
    longitude = float(sys.argv[1])
    latitude = float(sys.argv[2])
    altitude = float(sys.argv[3])
    date_range = sys.argv[4]            


    # Check if date_range contains a / character (indicating a range)
    if '/' in date_range:
        start_date, end_date = date_range.split('/')
    else:
        start_date = end_date = date_range
    
    print(f"Processing request for: Longitude: {longitude}, Latitude: {latitude}, Altitude: {altitude}")
    print(f"Date range: {start_date} to {end_date}")
    
    # Output filename with date range
    date_part = start_date.replace('-', '')
    if start_date != end_date:
        date_part += "_to_" + end_date.replace('-', '')
    output_filename = f"CAMS_SOLAR_{date_part}_{longitude}_{latitude}_{altitude}.csv"
    
    # Get absolute path
    #output_filepath = os.path.abspath(output_filename)
    output_filepath = os.path.join("/app/data", output_filename)
    print(output_filepath)
    # Check if file already exists
    if os.path.exists(output_filepath):
        print(f"File already exists at: {output_filepath}")
        print(f"CAMS_FILE_PATH={output_filepath}")  # Special marker for main.py to extract
        return 0

    # Authentication
    #DEDL_USER = os.environ.get("DEDL_USER")  # Default fallback if not in env
    #DEDL_USER = os.environ.get("DEDL_USER", "kpapachr@noa.gr")  # Default fallback if not in env
    #DEDL_PASSWORD = os.environ.get("DEDL_PASSWORD", "buc4gup*dat3HVB9unu")

    #DEDL_PASSWORD = os.environ.get("DEDL_PASSWORD")
    DEDL_USER = "kpapachr@noa.gr"
    DEDL_PASSWORD = "buc4gup*dat3HVB9unu"
    token_url = 'https://identity.data.destination-earth.eu/auth/realms/dedl/protocol/openid-connect/token'
    
    print("Authenticating...")
    response = requests.post(
        token_url,
        data={
            'grant_type': 'password',
            'scope': 'openid',
            'client_id': 'hda-public',
            'username': DEDL_USER,
            'password': DEDL_PASSWORD
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    response.raise_for_status()
    
    access_token = response.json()['access_token']
    auth_headers = {'Authorization': f'Bearer {access_token}'}
    
    # Search for data with correctly prefixed parameters
    print("Searching for data with correctly prefixed parameters...")
    search_payload = {
        "collections": ["EO.ECMWF.DAT.CAMS_SOLAR_RADIATION_TIMESERIES"],
        "datetime": f"{start_date}T00:00:00Z/{end_date}T23:59:59Z",
        "query": {
            "ecmwf:sky_type": {"eq": "observed_cloud"},
            "ecmwf:time_step": {"eq": "1hour"},
            "ecmwf:time_reference": {"eq": "universal_time"},
            "ecmwf:location": {"eq": {"latitude": latitude, "longitude": longitude}},
            "ecmwf:altitude": {"eq": altitude},
            "ecmwf:format": {"eq": "csv"}
        }
    }
    
    print(f"Search payload: {json.dumps(search_payload, indent=2)}")
    response = requests.post(
        "https://hda.data.destination-earth.eu/stac/search", 
        headers=auth_headers, 
        json=search_payload
    )
    
    # Check if we got a valid response
    if response.status_code != 200:
        print(f"Error in search request: {response.status_code}")
        print(f"Response content: {response.text}")
        
        # Fallback to a simpler query just to get a result
        print("Trying a simpler query format...")
        fallback_payload = {
            "collections": ["EO.ECMWF.DAT.CAMS_SOLAR_RADIATION_TIMESERIES"],
            "datetime": f"{start_date}T00:00:00Z/{end_date}T23:59:59Z"
        }
        
        response = requests.post(
            "https://hda.data.destination-earth.eu/stac/search", 
            headers=auth_headers, 
            json=fallback_payload
        )
        
        if response.status_code != 200:
            print("Fallback query also failed.")
            sys.exit(1)
    
    # Get download URL
    features = response.json().get("features", [])
    if not features:
        print("No data found for the specified parameters.")
        sys.exit(1)
    
    print(f"Found {len(features)} features")
    
    # Print the actual properties to understand what parameters were actually used
    print("Feature properties (showing actual parameters used):")
    properties = features[0].get("properties", {})
    for key, value in properties.items():
        if key.startswith("ecmwf:"):
            print(f"  {key}: {value}")
    
    # Get the first product
    product = features[0]
    download_url = product["assets"]["downloadLink"]["href"]
    print(f"Download URL: {download_url}")
    
    # Modify the download URL to include our parameters
    if "_dc_qs=" in download_url:
        import urllib.parse
        parts = download_url.split("_dc_qs=")
        base_url = parts[0] + "_dc_qs="
        encoded_params = parts[1].split("&")[0]  # Get just the encoded part
        
        # Try to decode it to see what's there
        try:
            # URL decode once
            decoded_once = urllib.parse.unquote(encoded_params)
            print(f"Original parameters (URL-decoded once): {decoded_once}")
            
            # URL decode twice (they appear to be double-encoded)
            decoded_twice = urllib.parse.unquote(decoded_once)
            print(f"Original parameters (URL-decoded twice): {decoded_twice}")
            
            # Try to parse as JSON
            try:
                params_json = json.loads(decoded_twice)
                print(f"Original parameters (as JSON): {json.dumps(params_json, indent=2)}")
            except:
                pass
        except:
            pass
        
        # Create new parameters with our values
        new_params = {
            "altitude": str(altitude),
            "date": f"{start_date}/{end_date}",
            "format": "csv",
            "location": {
                "latitude": str(latitude),
                "longitude": str(longitude)
            },
            "sky_type": "observed_cloud",
            "time_reference": "universal_time",
            "time_step": "1hour"
        }
        
        # Convert to JSON string
        new_params_json = json.dumps(new_params)
        print(f"New parameters JSON: {new_params_json}")
        
        # URL encode once
        encoded_once = urllib.parse.quote(new_params_json)
        
        # URL encode twice (to match the original format)
        encoded_twice = urllib.parse.quote(encoded_once)
        print(f"New parameters (URL-encoded twice): {encoded_twice}")
        
        # Replace in URL
        new_url = base_url + encoded_twice
        if "&" in parts[1]:
            new_url += "&" + parts[1].split("&", 1)[1]
        
        print(f"Original URL: {download_url}")
        print(f"Modified URL: {new_url}")
        download_url = new_url
    
    # Attempt direct download first
    print("Attempting direct download...")
    response = requests.get(download_url, headers=auth_headers)
    
    # If direct download successful (200)
    if response.status_code == 200:
        print("Direct download successful")
        with open(output_filepath, 'wb') as f:
            f.write(response.content)
        print(f"Data saved to: {output_filepath}")
        print(f"CAMS_FILE_PATH={output_filepath}")  # Special marker for main.py to extract
        return 0
    
    # If async job initiated (202)
    elif response.status_code == 202:
        print("Asynchronous processing detected")
        
        # Get job location from response
        try:
            job_info = response.json()
            job_location = job_info.get('location')
            print(f"Job info: {json.dumps(job_info, indent=2)}")
        except:
            job_location = None
        
        if not job_location and 'location' in response.headers:
            job_location = response.headers.get('location')
        
        if not job_location:
            print("No job location found in response")
            sys.exit(1)
        
        print(f"Job location: {job_location}")
        
        # Also modify the job location URL to include our parameters
        if "_dc_qs=" in job_location:
            import urllib.parse
            parts = job_location.split("_dc_qs=")
            base_url = parts[0] + "_dc_qs="
            
            # Create new parameters with our values (same as above)
            new_params = {
                "altitude": str(altitude),
                "date": f"{start_date}/{end_date}",
                "format": "csv",
                "location": {
                    "latitude": str(latitude),
                    "longitude": str(longitude)
                },
                "sky_type": "observed_cloud",
                "time_reference": "universal_time",
                "time_step": "1hour"
            }
            
            # Convert to JSON string
            new_params_json = json.dumps(new_params)
            
            # URL encode once
            encoded_once = urllib.parse.quote(new_params_json)
            
            # URL encode twice (to match the original format)
            encoded_twice = urllib.parse.quote(encoded_once)
            
            # Replace in URL
            new_url = base_url + encoded_twice
            if "&" in parts[1]:
                new_url += "&" + parts[1].split("&", 1)[1]
            
            print(f"Original job URL: {job_location}")
            print(f"Modified job URL: {new_url}")
            job_location = new_url
        
        # Skip job monitoring and just repeatedly try direct fetches from job location
        max_attempts = 30
        wait_time = 10  # seconds
        
        for attempt in range(max_attempts):
            print(f"Attempting fetch from job location (attempt {attempt+1}/{max_attempts})...")
            
            try:
                fetch_response = requests.get(job_location, headers=auth_headers)
                
                # If we get a 200 response, download successful
                if fetch_response.status_code == 200:
                    print("Download successful!")
                    
                    with open(output_filepath, 'wb') as f:
                        f.write(fetch_response.content)
                    
                    print(f"Data saved to: {output_filepath}")
                    #debug_log(f"Attempting to save file to: {output_filepath}")
                    print(f"CAMS_FILE_PATH={output_filepath}")  # Special marker for main.py to extract
                    return 0
                
                # If still 202, job still processing
                elif fetch_response.status_code == 202:
                    print(f"Job still processing. Waiting {wait_time} seconds...")
                    time.sleep(wait_time)
                
                # Other status codes
                else:
                    print(f"Received status code: {fetch_response.status_code}")
                    try:
                        print(f"Response content: {fetch_response.json()}")
                    except:
                        pass
                    time.sleep(wait_time)
            
            except Exception as e:
                print(f"Error fetching from job location: {str(e)}")
                time.sleep(wait_time)
        
        print("Maximum attempts reached without successful download")
        return 1
    
    # Any other status code
    else:
        print(f"Unexpected status code: {response.status_code}")
        try:
            print(f"Response content: {response.text}")
        except:
            pass
        return 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)