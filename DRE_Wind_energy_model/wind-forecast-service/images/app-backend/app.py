import requests
import os
from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime, timedelta
import subprocess
import pandas as pd
import numpy as np
import csv
import json
from typing import List, Dict, Literal

app = FastAPI()

# Get environment variables for callback URL and token
NOTIFICATION_URL = os.environ.get("NOTIFICATION_URL", "https://hyrefapp.dev.desp.space/api/Jobs/jobresult")
NOTIFICATION_TOKEN = os.environ.get("NOTIFICATION_TOKEN", "916ab7c8-acb39e299883-f1ca-419b-816b-7cfb307e6daf883b-aa91b02090b8")

@app.get("/health")
def home():
    return {"message": "FastAPI is running!"}

PowerCurveType = Literal['Vestas_V112_3000_Onshore', 'Vestas_V112_3000_Offshore', 'custom']

class ForecastItem(BaseModel):
    datetime: str
    poweroutput: float
    windspeed: float
    winddirection: float
    step: int

class AssessmentRequest(BaseModel):
    jobKey: str
    startDate: str
    lat: float
    lon: float
    height: float
    power_curve: PowerCurveType = 'Vestas_V112_3000_Onshore'
    capacity: float
    use_train_data: bool = False
    use_curve_data: bool = True

def get_power_curve_path(power_curve: PowerCurveType, job_key: str) -> str:
    if power_curve == 'custom':
        custom_path = f"/app/data/assessment/uploaded/{job_key}/custom_power_curve.csv"
        if not os.path.exists(custom_path):
            raise ValueError(f"Custom power curve not found at {custom_path}")
        return custom_path
    else:
        curve_path = f"/app/power_curves/{power_curve}.csv"
        if not os.path.exists(curve_path):
            raise ValueError(f"Power curve {power_curve} not found at {curve_path}")
        return curve_path

def calculate_power(wind_speed: float, power_curve: Dict[float, float]) -> float:
    closest_speed = min(power_curve.keys(), key=lambda x: abs(x - wind_speed))
    return power_curve[closest_speed]

def extract_and_reorganize(input_file, output_csv, center_lat, center_lon, job_key, power_curve):
    result_dir = os.path.dirname(output_csv)
    temp_dump_file = os.path.join(result_dir, f"temp_dump_{job_key}.txt")

    center_lon_fixed = center_lon % 360
    remap_target = f"lon={center_lon_fixed}_lat={center_lat}"

    cmd = [
        "cdo", "-s", "-outputtab,date,time,value",
        "-select,name=10u,10v",
        f"-remapnn,{remap_target}",
        input_file
    ]

    with open(temp_dump_file, "w") as f:
        result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True)

    if result.returncode != 0:
        raise RuntimeError(f"CDO extraction failed:\n{result.stderr}")

    with open(temp_dump_file, "r") as f:
        lines = [line.strip() for line in f if not line.startswith("#") and line.strip()]
        data = [line.split() for line in lines]

    grouped = []
    for i in range(0, len(data), 2):
        block = data[i:i+2]
        if len(block) == 2:
            datetime_str = block[0][0] + " " + (block[0][1] if len(block[0]) > 1 else "00:00:00")
            u_val = float(block[0][2])
            v_val = float(block[1][2])
            grouped.append([datetime_str, u_val, v_val])

    df = pd.DataFrame(grouped, columns=["timestamp", "10u", "10v"])
    df['timestamp'] = pd.to_datetime(df['timestamp'])

    u = df["10u"]
    v = df["10v"]

    df["wind_speed"] = np.sqrt(u**2 + v**2)
    wind_dir_rad = np.arctan2(-u, -v)
    df["wind_dir"] = (np.degrees(wind_dir_rad) + 360) % 360
    df["poweroutput"] = df["wind_speed"].apply(lambda ws: round(calculate_power(ws, power_curve), 2))


    final_df = pd.DataFrame({
        "timestamp": df["timestamp"],
        "poweroutput": df["poweroutput"],
        "wind_speed": df["wind_speed"],
        "wind_dir": df["wind_dir"]
    })

    final_df.to_csv(output_csv, index=False)

    if os.path.exists(temp_dump_file):
        os.remove(temp_dump_file)

def generate_forecast_from_grib(merged_grib_path: str, output_csv_path: str, center_lat: float, center_lon: float, job_key: str, power_curve: Dict[float, float]) -> List[Dict]:
    extract_and_reorganize(merged_grib_path, output_csv_path, center_lat, center_lon, job_key, power_curve)
    df = pd.read_csv(output_csv_path, parse_dates=["timestamp"])

    forecast = []
    for idx, row in df.iterrows():
        forecast.append({
            "datetime": row["timestamp"].isoformat() + "Z",
            "poweroutput": row["poweroutput"],
            "windspeed": round(row["wind_speed"], 2),
            "winddirection": round(row["wind_dir"], 2),
            "step": idx
        })
    return forecast

@app.post("/wind/forecast")
def process_forecast(request: AssessmentRequest):
    try:
        start_date = datetime.fromisoformat(request.startDate.replace("Z", ""))

        if not request.use_curve_data and request.power_curve == 'custom':
            raise ValueError("Cannot use 'custom' power curve when 'use_curve_data' is False.")

        if request.use_train_data:
            train_data_path = f"/app/data/forecast/uploaded/{request.jobKey}/wind_data.csv"
            if os.path.exists(train_data_path):
                print(f"[TRAIN DATA FOUND] Using training data at: {train_data_path}")
            else:
                print(f"[TRAIN DATA MISSING] Expected at: {train_data_path}")

        result_dir = f"/app/data/forecast/results/{request.jobKey}"
        os.makedirs(result_dir, exist_ok=True)

        grib1 = f"/data/165_2025_05_08.grib"
        grib2 = f"/data/166_2025_05_08.grib"
        merged_grib = f"{result_dir}/merged.grib"
        output_csv = f"{result_dir}/results.csv"

        merge_cmd = ["cdo", "merge", grib1, grib2, merged_grib]
        result = subprocess.run(merge_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        if result.returncode != 0:
            raise RuntimeError(f"CDO merge failed:\n{result.stderr}")

        power_curve_path = get_power_curve_path(request.power_curve, request.jobKey)
        
        power_curve = {}
        with open(power_curve_path, 'r') as f:
            reader = csv.reader(f)
            next(reader)  # skip header
            for row in reader:
                wind_speed = float(row[0])
                power_output = float(row[1])
                power_curve[wind_speed] = power_output

        raw_forecast = generate_forecast_from_grib(
            merged_grib, output_csv, center_lat=request.lat, center_lon=request.lon, job_key=request.jobKey, power_curve=power_curve
        )

        result_json = {"forecastvstime": raw_forecast}
        with open(f"{result_dir}/results.json", 'w') as f:
            json.dump(result_json, f, indent=2)

        if os.path.exists(merged_grib):
            os.remove(merged_grib)

        files_info = [
            {
                "path": f"/files/output/{request.jobKey}/results.csv",
                "friendlyname": "Power Output CSV",
                "size": os.path.getsize(f"/app/data/forecast/results/{request.jobKey}/results.csv")
            }
        ]

        callback_payload = {
            "jobKey": request.jobKey,
            "status": "Completed",
            "error": None,
            "datetime": datetime.utcnow().isoformat() + "Z",
            "datetimefrom": request.startDate,
            "payload": result_json,
            "files": files_info
        }

        headers = {
            "X-Job-Token": NOTIFICATION_TOKEN,
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(
                NOTIFICATION_URL,
                json=callback_payload,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            print(f"[CALLBACK SUCCESS] Status: {response.status_code} | Response: {response.text}")
        except requests.exceptions.RequestException as req_err:
            print("[CALLBACK ERROR] Failed to send callback.")
            print(f"Exception: {str(req_err)}")
            print("Payload was:")
            print(json.dumps(callback_payload, indent=2))

        return {
            "jobKey": request.jobKey,
            "status": "Accepted",
            "type": "forecast",
            "source": "wind",
            "error": None,
            "datetime": datetime.utcnow().isoformat() + "Z",
            "files_info": files_info,
            "forecastvstime": raw_forecast,
            "metadata": {
                "start_date": request.startDate,
                "power_curve": request.power_curve,
                "forecast_hours": len(raw_forecast),
                "generated_at": datetime.utcnow().isoformat() + "Z"
            }
        }

    except Exception as e:
        return {
            "jobKey": request.jobKey,
            "status": "Rejected",
            "type": "forecast",
            "source": "wind",
            "error": str(e),
            "datetime": datetime.utcnow().isoformat() + "Z"
        }

