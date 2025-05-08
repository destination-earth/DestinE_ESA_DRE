# Use Python 3.9 as the base image
FROM python:3.9-slim

# Set working directory in the container
WORKDIR /app

# Create and set permissions for tmp directory
RUN mkdir -p /tmp && chmod 1777 /tmp
RUN mkdir -p /app/tmp && chmod 1777 /app/tmp
ENV TMPDIR=/app/tmp

# Install system dependencies required for numpy/pandas
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the FastAPI application code
COPY main.py .

# Create a data directory for mounting CSV files
RUN mkdir -p /app/data

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]