# Use Miniconda as base image
FROM continuumio/miniconda3

# Set environment variables
ENV APP_HOME /app

# Set working directory
WORKDIR $APP_HOME

# Copy files
COPY environment.yml .
COPY app.py .
COPY destinelab-1.1.tar.gz .
RUN mkdir -p /app/power_curves
COPY ./power_curves/ $APP_HOME/power_curves/
# Clean any broken Conda packages
RUN conda clean --all -y && rm -rf /opt/conda/pkgs/*

# Install dependencies
RUN conda update -n base -c defaults conda -y && \
    conda env create -f environment.yml && \
    conda clean --all -y

# Setup shell to activate env automatically
SHELL ["/bin/bash", "-c"]

RUN echo "source activate destine" >> ~/.bashrc
RUN echo "conda activate destine" >> ~/.bashrc

# Create data folders
RUN mkdir -p $APP_HOME/data && chmod -R 777 $APP_HOME/data
#RUN mkdir -p $APP_HOME/data_dt && chmod -R 777 $APP_HOME/data_dt
RUN mkdir -p /data && chmod -R 777 /data

# Expose FastAPI port
EXPOSE 8000

# Start Uvicorn with Conda environment activated
CMD ["/bin/bash", "-c", "source activate destine && uvicorn app:app --host 0.0.0.0 --port 8000"]
