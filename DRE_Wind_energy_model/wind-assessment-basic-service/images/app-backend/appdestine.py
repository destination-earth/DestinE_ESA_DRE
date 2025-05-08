from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from datetime import datetime, timedelta
import time
import subprocess
import json
import os
import pandas as pd
import requests

app = FastAPI()

NOTIFICATION_URL = os.environ.get("NOTIFICATION_URL", "https://hyrefapp.dev.desp.space/api/Jobs/jobresult")
NOTIFICATION_TOKEN = os.environ.get("NOTIFICATION_TOKEN", "916ab7c8-acb39e299883-f1ca-419b-816b-7cfb307e6daf883b-aa91b02090b8")

class DownloadRequest(BaseModel):
    startDate: str
    endDate: str
    jobKey: str
    latitude: str
    longitude: str
    height: str

@app.get("/health")
def home():
    return {"message": "FastAPI is running!"}

@app.post("/assessment/basic")
def basic_assessment(request: DownloadRequest, background_tasks: BackgroundTasks):
    try:
        background_tasks.add_task(run_basic_job, request)
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

def run_basic_job(request: DownloadRequest):
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

            print(f"\n=== Iteration {iteration} ===")
            print(f"Chunk range: {chunk_start.isoformat()}Z to {chunk_end.isoformat()}Z")
            time.sleep(5)

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
        result_dir = f"/app/data/assessment/results/{request.jobKey}"
        os.makedirs(result_dir, exist_ok=True)
        combined_data_path = f"{result_dir}/wind_data.csv"
        combined_df.to_csv(combined_data_path, index=False)

        calc_result = subprocess.run(
            ["python3.10", "calculations.py", combined_data_path, request.startDate, request.endDate],
            capture_output=True, text=True
        )

        if calc_result.returncode != 0:
            raise Exception(f"Calculations failed: {calc_result.stderr}")

        result_json = json.loads(calc_result.stdout)
        json_path = f"{result_dir}/results.json"
        with open(json_path, "w") as f:
            json.dump(result_json, f)

        files_info = [
            {
                "path": f"/files/output/{request.jobKey}/wind_data.csv",
                "friendlyname": "Wind Data CSV",
                "size": os.path.getsize(combined_data_path)
            },
            {
                "path": f"/files/output/{request.jobKey}/results.json",
                "friendlyname": "Calculation Result JSON",
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

        try:
            os.unlink(combined_data_path)
        except Exception as e:
            print(f"Could not delete {combined_data_path}: {str(e)}")

    except Exception as e:
        print(f"[ERROR in basic background job] {str(e)}")

