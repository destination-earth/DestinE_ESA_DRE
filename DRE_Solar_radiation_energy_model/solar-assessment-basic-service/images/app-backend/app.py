# app.py
import os
from flask import Flask, request, jsonify
from tasks import run_solar_assessment
import uvicorn
from uvicorn.middleware.wsgi import WSGIMiddleware
from datetime import datetime
flask_app = Flask(__name__)


# Initializing the notification URL
NOTIFICATION_URL = os.environ.get(
    "NOTIFICATION_URL",
    "https://hyrefapp.dev.desp.space/api/Jobs/jobupdate"
)

# Initializing the notification token
NOTIFICATION_TOKEN = os.environ.get(
    "NOTIFICATION_TOKEN",
    "916ab7c8-acb39e299883-f1ca-419b-816b-7cfb307e6daf883b-aa91b02090b8"
)


@flask_app.route("/solar-basic-assessment-service", methods=["POST"])
def solar():
    """
    Example request JSON:
    {
        "jobKey": "job_unique_key",
        "startDate": "2025-03-26T15:11:32.049Z",
        "endDate": "2025-03-26T15:11:32.049Z",
        "latitude": 0,
        "longitude": 0
    }
    """

    data = request.get_json()
    lat = data.get('latitude')
    lon = data.get('longitude')
    start_datetime = data.get('startDate')
    end_datetime = data.get('endDate')
    job_key = data.get('jobKey')

    # Validate required fields
    if None in [lat, lon, start_datetime, end_datetime]:
        return jsonify({"error": "Missing required fields."}), 400

    # Get datetime to include in response
    current_time = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

    try:

        # Enqueue background task
        task = run_solar_assessment.apply_async(
            args=[lat, lon, start_datetime, end_datetime, job_key]
        )

        # Return acceptance response
        return jsonify({
            "jobKey": job_key,
            "status": "Accepted",
            "type": "assessment",
            "source": "solar",
            "error": None,
            "datetime": current_time
        }), 202

    except Exception as error:
        return jsonify({
            "jobKey": job_key,
            "status": "Rejected",
            "type": "assessment",
            "source": "solar",
            "error": error,
            "datetime": current_time
        }), 400


@flask_app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


# Wrap the Flask WSGI app in WSGIMiddleware so Uvicorn (ASGI) can serve it
asgi_app = WSGIMiddleware(flask_app)


if __name__ == "__main__":
    # If you run `python app.py` locally, it starts Uvicorn.
    # In the Docker container we'll use ENTRYPOINT below.
    uvicorn.run(asgi_app, host="0.0.0.0", port=8000)
