from pathlib import Path
import argparse
import logging
import sys
import cams_tools.cams_tools as cams_tools
from dotenv import load_dotenv
import pandas as pd
import json


def main(
        lat,
        lon,
        start_datetime,
        end_datetime,
        tilt,
        azim,
        tracking,
        capacity,
        panel_technology,
        job_key
):

    # Loading environment variables from the .env file
    load_dotenv()

    # Initializing empty variables
    files = []
    data = {}

    # Preparing job results directory using pathlib
    results_directory = Path("/app/data/assessment/results") / job_key
    results_directory.mkdir(parents=True, exist_ok=True)

    # Initializing instances of CAMSSolarRadiationQuery Class for hourly and daily products
    query_hourly, query_daily = (
        cams_tools.AssessmentQuery(
            lat,
            lon,
            start_datetime,
            end_datetime,
            timestep,
            "observed_cloud",
            "universal_time",
            "csv",
            171,
            results_directory
        )
        for timestep in ['1hour', '1day']
    )

    # Downloading CAMS Solar Radiation time series and assigning its filename to a variable
    cams_hourly_file_path = query_hourly.download()
    cams_daily_file_path = query_daily.download()

    # Updating the list of files that will be made available to the user through the response
    for path, timestep in zip(
            [cams_hourly_file_path, cams_daily_file_path],
            ['1hour', '1day']
    ):
        files.append({
            "path": str(path),
            "friendlyname": f"CAMS Solar Radiation Timeseries {timestep} JSON",
            "size": path.stat().st_size
        })

    # Getting the values to be plotted
    df_hourly = query_hourly.load_and_preprocess_df()
    df_daily = query_daily.load_and_preprocess_df()

    ghi_hourly = df_hourly['GHI']

    # ------------------------------------------------------------------------------------------------------------------
    # Calculating hourly clearness index
    # ------------------------------------------------------------------------------------------------------------------

    clearness_index_hourly = query_hourly.get_clearness_index()

    # ------------------------------------------------------------------------------------------------------------------
    # Calculating daily clearness index
    # ------------------------------------------------------------------------------------------------------------------

    clearness_index_daily = query_daily.get_clearness_index()

    # ------------------------------------------------------------------------------------------------------------------
    # Calculating diffuse fraction using the BRL model
    # ------------------------------------------------------------------------------------------------------------------

    brl = cams_tools.BRLModel(clearness_index_hourly, lat, lon, 'lauret', clearness_index_daily)
    diffuse_fraction = brl.run()

    # ------------------------------------------------------------------------------------------------------------------
    # Calculating PV production
    # ------------------------------------------------------------------------------------------------------------------

    data = pd.DataFrame({
        'Index': diffuse_fraction.index,
        'diffuse_fraction': diffuse_fraction.values,
        'global_horizontal': df_hourly['GHI'].values
    })

    data.set_index('Index', inplace=True)
    data.index = pd.to_datetime(data.index)

    # List to store results for each technology
    results = []

    r = cams_tools.run_model(
        data,
        (lat, lon),
        tilt,
        azim,
        tracking,
        capacity,
        None,
        False,
        technology=panel_technology,
    )

    months_dict = cams_tools.seasonal_profile_dict_from_series(r)

    # 1. Write to a JSON file
    with open('/output/monthly_means.json', 'w') as f:
        json.dump(months_dict, f, indent=2)

    # ------------------------------------------------------------------------------------------------------------------
    # Storing output .json file
    # ------------------------------------------------------------------------------------------------------------------

    # Turning pd.Series to json
    json_data = r.rename_axis('timestamp').to_dict()
    json_serializable = {k.strftime('%Y-%m-%dT%H:%M:%S'): v for k, v in json_data.items()}

    # build the full path to your JSON file
    output_file_path = results_directory / 'output.json'

    # write out the JSON
    with output_file_path.open('w') as f:
        json.dump(json_serializable, f, indent=4)

    # --------------------------------------------------------------------------------------------------------------
    # Updating list of files
    # --------------------------------------------------------------------------------------------------------------

    files.append(
        {
            "path": str(output_file_path),
            "friendlyname": "Multi year monthly means JSON",
            "size": output_file_path.stat().st_size
        }
    )

    return {
        "success": True,
        "payload": json_serializable,
        "files": files
    }


if __name__ == "__main__":

    # Configure basic logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    logger = logging.getLogger(__name__)

    parser = argparse.ArgumentParser(
        description="Download CAMS solar radiation data, compute clearness indices, "
                    "diffuse fractions, and PV production."
    )
    # Required positional arguments
    parser.add_argument(
        "lat", type=float,
        help="Latitude of the site (decimal degrees, e.g. 51.5)"
    )
    parser.add_argument(
        "lon", type=float,
        help="Longitude of the site (decimal degrees, e.g. -0.1)"
    )
    parser.add_argument(
        "tilt", type=float,
        help="Module tilt angle (degrees from horizontal)"
    )
    parser.add_argument(
        "azim", type=float,
        help="Module azimuth angle (degrees from north, east=90)"
    )
    parser.add_argument(
        "tracking", type=lambda s: s.lower() in ("true", "1", "yes"),
        help="Whether the system uses tracking (true/false)"
    )
    parser.add_argument(
        "capacity", type=float,
        help="System capacity in kW"
    )

    # Optional keyword arguments
    parser.add_argument(
        "--start-datetime", "-s",
        default="2024-11-01T00:00:00",
        help="Start of analysis period (ISO 8601 format, default: %(default)s)"
    )
    parser.add_argument(
        "--end-datetime", "-e",
        default="2024-11-02T00:00:00",
        help="End of analysis period (ISO 8601 format, default: %(default)s)"
    )
    parser.add_argument(
        "--panel-technology", "-p",
        choices=["cdte", "cigs", "mono_si", "poly_si"],
        default="cdte",
        help="PV module technology (default: %(default)s)"
    )
    parser.add_argument(
        "--job-key", "-j",
        required=True,
        help="Unique job key for results directory"
    )

    args = parser.parse_args()

    try:
        logger.info("Starting CAMS PV assessment for job %s", args.job_key)
        main(
            lat=args.lat,
            lon=args.lon,
            start_datetime=args.start_datetime,
            end_datetime=args.end_datetime,
            tilt=args.tilt,
            azim=args.azim,
            tracking=args.tracking,
            capacity=args.capacity,
            panel_technology=args.panel_technology,
            job_key=args.job_key
        )
        logger.info("Completed successfully.")
    except Exception as ex:
        logger.exception("An error occurred during processing")
        sys.exit(1)
