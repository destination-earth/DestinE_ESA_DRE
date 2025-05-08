FROM python:3.11-slim
WORKDIR /app
COPY . /app
COPY celery_app.py tasks.py ./

# Configure Matplotlib cache
ENV MPLCONFIGDIR=/tmp
RUN mkdir -p /tmp && chmod 1777 /tmp

# Install cams_tools package
COPY cams_tools/ ./cams_tools/

RUN apt-get update && apt -y install procps

RUN pip install ./cams_tools

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py main.py celery_app.py tasks.py /app/

# Expose port and start Uvicorn
CMD ["uvicorn", "app:asgi_app", "--host", "0.0.0.0", "--port", "8000"]
