FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libeccodes-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt main.py ./
RUN pip install --no-cache-dir -r requirements.txt

# Create directories
RUN mkdir -p data config

# Set environment variables
ENV POLYTOPE_RCFILE=/root/.polytopeapirc
ENV PYTHONUNBUFFERED=1- 
ENV DESP_USERNAME=ageorgakis@noa.gr
ENV DESP_PASSWORD=3Tg)B%Nb&u2CR,C

# Run the app
ENTRYPOINT ["python", "main.py"]