from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from datetime import datetime, timedelta
import time
import subprocess
import json
import os
from typing import Literal
import pandas as pd
import requests
from fastapi.staticfiles import StaticFiles

# Configs: Notification endpoint & token fallback (can be overridden by environment)
NOTIFICATION_URL = os.environ.get("NOTIFICATION_URL", "https://hyrefapp.dev.desp.space/api/Jobs/jobresult")
NOTIFICATION_TOKEN = os.environ.get("NOTIFICATION_TOKEN", "916ab7c8-acb39e299883-f1ca-419b-816b-7cfb307e6daf883b-aa91b02090b8")

app = FastAPI()

# Expose result files under /files/output
app.mount("/files/output", StaticFiles(directory="/app/data/assessment/results"), name="output")

PowerCurveType = Literal['Vestas_V112_3000_Onshore', 'Vestas_V112_3000_Offshore', 'custom']

class DownloadRequest(BaseModel):
    startDate: str
    endDate: str
    jobKey: str
    latitude: str
    longitude: str
    height: str
    power_curve: PowerCurveType = 'Vestas_V112_3000_Onshore'
    custom_power_curve: str = None

@app.get("/health")
def home():
    return {"message": "FastAPI is running!"}

def get_power_curve_path(power_curve: PowerCurveType, job_key: str) -> str:
    if power_curve == 'custom':
        custom_path = f"/app/data/assessment/uploaded/{job_key}/custom_power_curve.csv"
        if not os.path.exists(custom_path):
            raise ValueError(f"Custom power curve not found at {custom_path}")
        return custom_path
    else:
        curve_path = f"/power_curves/{power_curve}.csv"
        if not os.path.exists(curve_path):
            raise ValueError(f"Power curve {power_curve} not found at {curve_path}")
        return curve_path

@app.post("/assessment/premium")
def premium_assessment(request: DownloadRequest, background_tasks: BackgroundTasks):
    try:
        background_tasks.add_task(run_assessment_job, request)
        return {
            "jobKey": request.jobKey,
            "status": "Accepted",
            "type": "assessment",
            "source": "wind",
            "error": None,
            "datetime": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        return {
            "jobKey": request.jobKey,
            "status": "Rejected",
            "type": "assessment",
            "source": "wind",
            "error": str(e),
            "datetime": datetime.utcnow().isoformat() + "Z"
        }

def run_assessment_job(request: DownloadRequest):
    try:
        start_date = datetime.fromisoformat(request.startDate.replace("Z", ""))
        end_date = datetime.fromisoformat(request.endDate.replace("Z", ""))

        results = []
        chunk_start = start_date
        iteration = 0

        while chunk_start < end_date:
            iteration += 1
            chunk_end = min(chunk_start + timedelta(days=24), end_date)
            if chunk_end == chunk_start:
                break

            print(f"[INFO] Running chunk {iteration} from {chunk_start} to {chunk_end}")
            time.sleep(2)

            chunk_request = request.dict()
            chunk_request.update({
                "startDate": chunk_start.isoformat() + "Z",
                "endDate": chunk_end.isoformat() + "Z"
            })

            result = subprocess.run(
                ["python3.10", "download.py", json.dumps(chunk_request)],
                stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True
            )

            if result.returncode != 0:
                raise Exception(f"Download failed: {result.stdout}")

            lines = result.stdout.strip().splitlines()
            csv_lines = [line.strip().strip("'\"") for line in lines if line.strip().endswith("wind_data.csv")]
            if not csv_lines:
                raise Exception("Could not find CSV path in subprocess output.")
            csv_path = csv_lines[-1]

            df = pd.read_csv(csv_path)
            results.append({
                "job_key": request.jobKey,
                "dates": df['datetime'].tolist(),
                "wind_speed": df['wind_speed'].tolist(),
                "wind_direction": df['wind_direction'].tolist()
            })

            try:
                os.remove(csv_path)
            except:
                pass

            chunk_start = chunk_end

        combined_df = pd.concat([
            pd.DataFrame({
                "datetime": r["dates"],
                "wind_speed": r["wind_speed"],
                "wind_direction": r["wind_direction"]
            }) for r in results
        ])
        combined_data_path = f"/app/data/assessment/results/{request.jobKey}/wind_data.csv"
        combined_df.to_csv(combined_data_path, index=False)

        power_curve_path = get_power_curve_path(request.power_curve, request.jobKey)

        calc_result = subprocess.run(
            ["python3.10", "run_analysis.py", combined_data_path, power_curve_path, request.startDate, request.endDate],
            capture_output=True, text=True
        )

        json_path = f"/app/data/assessment/results/{request.jobKey}/results.json"
        if not os.path.exists(json_path) or os.path.getsize(json_path) == 0:
            raise Exception("Results JSON not created or is empty")

        with open(json_path, 'r') as f:
            result_json = json.load(f)

        files_info = [
            {
                "path": f"/files/output/{request.jobKey}/results.csv",
                "friendlyname": "Power Output CSV",
                "size": os.path.getsize(f"/app/data/assessment/results/{request.jobKey}/results.csv")
            },
            {
                "path": f"/files/output/{request.jobKey}/results.json",
                "friendlyname": "Analysis Result JSON",
                "size": os.path.getsize(json_path)
            }
        ]

        callback_payload = {
            "jobKey": request.jobKey,
            "status": "Completed",
            "error": None,
            "datetime": datetime.utcnow().isoformat() + "Z",
            "datetimefrom": request.startDate,
            "datetimeto": request.endDate,
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

    except Exception as e:
        print(f"[ERROR in background job] {str(e)}")

