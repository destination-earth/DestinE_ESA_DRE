import requests
import json
import os
import zipfile
import re
import sys
from getpass import getpass
from tqdm import tqdm
import destinelab as deauth
import cfgrib  # For GRIB file processing
import xarray as xr
import numpy as np
import pandas as pd
import math
import logging
from scipy import stats
#

logging.basicConfig(stream=sys.stderr, level=logging.INFO)
# Read JSON input from FastAPI
if len(sys.argv) < 2:
    print("Error: No input provided!")
    sys.exit(1)

request_data = json.loads(sys.argv[1])

DESP_USERNAME = os.getenv("WIND_USERNAME")
DESP_PASSWORD = os.getenv("WIND_PASSWORD")


START_DATE = request_data["startDate"]
END_DATE = request_data["endDate"]
#VARIABLE = request_data["variable"]
JOB_KEY1 = request_data["jobKey"]
LATITUDE = request_data["latitude"]
LONGITUDE = request_data["longitude"]
#HEIGHT = request_data["height"]
HEIGHT = int(request_data["height"])
print(f"Received request: {request_data}")


def nonlinear_direction_interpolation(z1, z2, dir1, dir2, target_z):
    """Interpolate wind direction using a nonlinear approach considering Ekman turning."""
    # Convert degrees to radians
    dir1_rad = np.radians(dir1)
    dir2_rad = np.radians(dir2)

    # Define a power-law factor based on height for nonlinear interpolation
    alpha = (np.log(target_z / z1) / np.log(z2 / z1))**0.6  # Exponent 0.6 is empirically chosen
    interpolated_dir = dir1_rad + alpha * (dir2_rad - dir1_rad)

    # Convert back to degrees and normalize
    return (np.degrees(interpolated_dir)) % 360

def power_law_speed_interpolation(z1, z2, v1, v2, target_z):
    """Interpolate wind speed using power law based on two levels."""
    # Estimate alpha (wind shear exponent) from known speeds
    alpha = np.log(v2 / v1) / np.log(z2 / z1)
    # Apply power law to interpolate
    return v1 * (target_z / z1) ** alpha
##################################
wind_variables = ["100m_u_component_of_wind", "100m_v_component_of_wind","10m_u_component_of_wind", "10m_v_component_of_wind"]
###################################GEO-INFO###########
lat = float(LATITUDE)
lon = float(LONGITUDE)
# Latitude handling
if lat >= 0:
    South = format(math.floor(lat / 0.25) * 0.25, ".2f")
    North = format((math.floor(lat / 0.25) + 1) * 0.25, ".2f")
else:
    South = format(math.floor(lat / 0.25) * 0.25, ".2f")
    North = format((math.floor(lat / 0.25) + 1) * 0.25, ".2f")

# Longitude handling
if lon >= 0:
    West = format(math.floor(lon / 0.25) * 0.25, ".2f")
    East = format((math.floor(lon / 0.25) + 1) * 0.25, ".2f")
else:
    West = format(math.floor(lon / 0.25) * 0.25, ".2f")
    East = format((math.floor(lon / 0.25) + 1) * 0.25, ".2f")

# Handle edge cases for West and East when lat/lon == -0.00
if West == "-0.00":
    West = "0.00"
if East == "-0.00":
    East = "0.00"

print("West South East North", West,South,East,North)

auth = deauth.AuthHandler(DESP_USERNAME, DESP_PASSWORD)
access_token = auth.get_token()

if access_token is not None:
    print("DEDL/DESP Access Token Obtained Successfully")
else:
    print("Failed to Obtain DEDL/DESP Access Token")

auth_headers = {"Authorization": f"Bearer {access_token}"}

datechoice = f"{START_DATE}/{END_DATE}"
filters = {
    key: {"eq": value}
    for key, value in {
        "format": "grib",
        "variable": wind_variables,
        "time": ["00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"]
    }.items()
}

response = requests.post("https://hda.data.destination-earth.eu/stac/search", headers=auth_headers, json={
    "collections": ["EO.ECMWF.DAT.REANALYSIS_ERA5_SINGLE_LEVELS"],
    "datetime": datechoice,
    "bbox": [float(West), float(South), float(East), float(North)],
    "query": filters
})

if (response.status_code != 200):
    (print(response.text))

product = response.json()["features"][0]
product["id"]
download_url = product["assets"]["downloadLink"]["href"]

HTTP_SUCCESS_CODE = 200
HTTP_ACCEPTED_CODE = 202

direct_download_url=''

response = requests.get(download_url, headers=auth_headers,timeout=60)
if (response.status_code == HTTP_SUCCESS_CODE):
    direct_download_url = product['assets']['downloadLink']['href']
elif (response.status_code != HTTP_ACCEPTED_CODE):
    print(response.text)
print(download_url)
response.raise_for_status()


if direct_download_url=='':
    while url := response.headers.get("Location"):
        print(f"order status: {response.json()['status']}")
        response = requests.get(url, headers=auth_headers, stream=True)
        response.raise_for_status()

if (response.status_code not in (HTTP_SUCCESS_CODE,HTTP_ACCEPTED_CODE)):
     (print(response.text))
response.raise_for_status()

filename = re.findall('filename=\"?(.+)\"?', response.headers["Content-Disposition"])[0]
total_size = int(response.headers.get("content-length", 0))

custom_filename = f'/app/data/assessment/results/{JOB_KEY1}/testnew2.zip'
os.makedirs(f"/app/data/assessment/results/{JOB_KEY1}", exist_ok=True)

print(f"downloading {filename} and saving as {custom_filename}")
#define your own name
with tqdm(total=total_size, unit="B", unit_scale=True) as progress_bar:
    with open(custom_filename, 'wb') as f:
        for data in response.iter_content(1024):
            progress_bar.update(len(data))
            f.write(data)

if os.path.exists(custom_filename):
    print(f"File successfully downloaded: {custom_filename}")
else:
    print(f"ERROR: File not found! {custom_filename}")

grib_file_path = f'/app/data/assessment/results/{JOB_KEY1}/data.grib'

with zipfile.ZipFile(custom_filename, 'r') as zip_ref:
    zip_ref.extract("data.grib",f"/app/data/assessment/results/{JOB_KEY1}")
    print("Extracted files:", os.listdir("/app/data/assessment/results/{JOB_KEY1}"))


ds = xr.open_dataset(
    f"/app/data/assessment/results/{JOB_KEY1}/data.grib",
    engine="cfgrib",
    backend_kwargs={"indexpath": ''},
)

#print(ds)
u_10 = ds['u10'].interp(latitude=lat, longitude=lon)
v_10 = ds['v10'].interp(latitude=lat, longitude=lon)
#ds['u_interp'], ds['v_interp'] = u_interp, v_interp
wind_speed_10 = np.sqrt(u_10**2 + v_10**2)
wind_direction_10 = np.mod(180 + (180/np.pi) * np.arctan2(u_10, v_10), 360)

u_100 = ds['u100'].interp(latitude=lat, longitude=lon)
v_100 = ds['v100'].interp(latitude=lat, longitude=lon)
#ds['u_interp'], ds['v_interp'] = u_interp, v_interp
wind_speed_100 = np.sqrt(u_100**2 + v_100**2)
wind_direction_100 = np.mod(180 + (180/np.pi) * np.arctan2(u_100, v_100), 360)


wind_direction = nonlinear_direction_interpolation(10, 100, wind_direction_10, wind_direction_100, float(HEIGHT))

wind_speed = power_law_speed_interpolation(10, 100, wind_speed_10, wind_speed_100, float(HEIGHT))

try:
    if os.path.exists(custom_filename):
        os.remove(custom_filename)  # Remove the zip file
        print(f"Removed the zip file: {custom_filename}")
    
    if os.path.exists(grib_file_path):
        os.remove(grib_file_path)  # Remove the extracted grib file
        print(f"Removed the grib file: {grib_file_path}")
except Exception as e:
    print(f"Error while deleting files: {str(e)}")

csv_path = f"/app/data/assessment/results/{JOB_KEY1}/wind_data.csv"
pd.DataFrame({
    'datetime': ds["time"].values.astype(str),
    'wind_speed': wind_speed.values,
    'wind_direction': wind_direction.values
}).to_csv(csv_path, index=False)

# Keep existing cleanup
try:
    if os.path.exists(custom_filename):
        os.remove(custom_filename)
        print(f"Removed the zip file: {custom_filename}")
    if os.path.exists(grib_file_path):
        os.remove(grib_file_path)
        print(f"Removed the grib file: {grib_file_path}")
except Exception as e:
    print(f"Error while deleting files: {str(e)}")

sys.stdout.write(csv_path + "\n")
sys.stdout.flush()
