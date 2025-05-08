# Use Miniconda as base image
FROM continuumio/miniconda3

# Set working directory
WORKDIR /app

# Copy files
COPY environment.yml .
COPY app.py .
COPY download_destine.py /app/download.py
COPY calculations.py /app/compute_wind_statistics.py
COPY destinelab-1.1.tar.gz .
COPY power_calculations.py .
COPY run_analysis.py .
#COPY cdsapicode /root/.cdsapirc
# Remove any previous broken Conda packages
RUN conda clean --all -y && rm -rf /opt/conda/pkgs/*

# Install dependencies
RUN conda update -n base -c defaults conda -y && \
    conda env create -f environment.yml && \
    conda clean --all -y

RUN mkdir -p /app/power_curves
COPY ./power_curves/ $APP_HOME/power_curves/
# Activate Conda in shell
SHELL ["/bin/bash", "-c"]

# Setup shell to activate env automatically
RUN echo "source activate destine" >> ~/.bashrc
RUN echo "conda activate destine" >> ~/.bashrc

# Create downloads directory with permissions
RUN mkdir -p /app/data && chmod -R 777 /app/data

# Expose FastAPI port
EXPOSE 8000

# Run Uvicorn with environment activated
CMD ["/bin/bash", "-c", "source activate destine && uvicorn app:app --host 0.0.0.0 --port 8000"]
