FROM python:3.9-slim

WORKDIR /app

# Create and set permissions for tmp directory
RUN mkdir -p /tmp && chmod 1777 /tmp
RUN mkdir -p /app/tmp && chmod 1777 /app/tmp
ENV TMPDIR=/app/tmp

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py hda_cams.py ./

# Create directory for data
RUN mkdir -p /app/data

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
