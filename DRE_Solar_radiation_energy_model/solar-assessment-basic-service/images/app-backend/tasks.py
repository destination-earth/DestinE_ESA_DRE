import os
import requests
from datetime import datetime
from celery_app import celery
from main import main as solar_assessment_basic_service

# posting to jobs results endpoint
NOTIFICATION_URL = os.getenv(
    'NOTIFICATION_URL',
    'https://hyrefapp.dev.desp.space/api/Jobs/jobresult'
)

NOTIFICATION_TOKEN = os.getenv(
    'NOTIFICATION_TOKEN',
    '916ab7c8-acb39e299883-f1ca-419b-816b-7cfb307e6daf883b-aa91b02090b8'
)


@celery.task(bind=True)
def run_solar_assessment(
        self,
        lat,
        lon,
        start_datetime,
        end_datetime,
        job_key=None
):

    try:

        # --------------------------------------------------------------------------------------------------------------
        # Step 1 : Running the task
        # --------------------------------------------------------------------------------------------------------------

        result = solar_assessment_basic_service(
            lat,
            lon,
            start_datetime,
            end_datetime,
            job_key
        )

        # --------------------------------------------------------------------------------------------------------------
        # Step 2 : Updating the job status
        # --------------------------------------------------------------------------------------------------------------

        result = {
            'jobKey': job_key,
            'status': 'Completed',
            'error': None,
            'datetime': datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
            'payload': result["payload"],
            'files': result["files"]
        }

        headers = {
            'X-Job-Token': f'{NOTIFICATION_TOKEN}',
            'Content-Type': 'application/json'
        }

        resp = requests.post(NOTIFICATION_URL, json=result, headers=headers)
        resp.raise_for_status()

        return 1

    except Exception as e:

        self.update_state(
            state='FAILURE',
            meta={
                'exc_type': type(e).__name__,
                'exc': str(e)
            }
        )
        raise
