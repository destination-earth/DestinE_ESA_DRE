FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libeccodes-dev \
    libhdf5-serial-dev \
    libnetcdf-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install the additional packages for R data file reading
RUN pip install --no-cache-dir pyreadr

# Create necessary directories
RUN mkdir -p /app/data /app/data_pool /data

# Copy application code
COPY main.py .
COPY data_pool/ ./data_pool/
COPY aod_variables/ ./aod_variables/

# Expose the port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]