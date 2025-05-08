from cams_tools import cams_tools
from dotenv import load_dotenv
import os
import sys
import json
from pathlib import Path


def main(
        lat,
        lon,
        start_datetime,
        end_datetime,
        job_key
):

    """
    Queries and processes CAMS solar radiation data for a given location and time range.

    For each of the available timesteps ('1minute', '15minute', '1hour', '1day', '1month'),
    this function:
    - Initializes a CAMSSolarRadiationQuery.
    - Downloads the corresponding CAMS timeseries data in CSV format.
    - Records metadata for each downloaded file (path, name, size).

    For the '15minute' timestep specifically:
    - Calculates multi-year monthly means for 'GHI' and 'BNI' variables.
    - Saves the results as a JSON file in a job-specific directory.
    - Records metadata for this JSON file.

    Parameters:
        lat (float): Latitude of the location.
        lon (float): Longitude of the location.
        start_datetime (str): Start datetime in ISO format (e.g., '2023-01-01T00:00:00').
        end_datetime (str): End datetime in ISO format (e.g., '2023-12-31T23:59:59').
        job_key (str): Unique identifier for storing job-specific outputs.

    Returns:
        dict: {
            "success": bool indicating if the operation completed,
            "payload": dict containing monthly means for 'GHI' and 'BNI' (only for '15minute'),
            "files": list of dicts with metadata about saved files (path, friendlyname, size)
        }
    """

    # Loading environment variables
    load_dotenv()

    # Initializing empty variables
    files = []
    data = {}

    # Preparing job results directory using pathlib
    results_directory = Path("/app/data/assessment/results") / job_key
    results_directory.mkdir(parents=True, exist_ok=True)

    # Iterating over all 5 possible time steps
    for timestep_user_input in ['1minute', '15minute', '1hour', '1day']:

        # Creating an instance of the AssessmentQuery class, which is responsible for executing the query
        query = cams_tools.AssessmentQuery(
                lat,
                lon,
                start_datetime,
                end_datetime,
                timestep_user_input,
                "observed_cloud",
                "universal_time",
                "csv",
                171,
                results_directory
            )

        # Downloading product and assigning its file path name to the variable 'cams_file_path'
        cams_file_path = query.download()

        # Updating list of files that will be made available to the user through the response
        files.append(
            {
                "path": str(cams_file_path),
                "friendlyname": "CAMS Solar Radiation Timeseries {} JSON".format(timestep_user_input),
                "size": cams_file_path.stat().st_size
            }
        )

        # --------------------------------------------------------------------------------------------------------------
        # Calculating multi year monthly means
        # --------------------------------------------------------------------------------------------------------------

        if timestep_user_input == '15minute':

            multi_year_monthly_means_path = results_directory / 'multi_year_monthly_means.json'

            # Iterating over the two variables of interest, i.e., 'GHI' and 'BNI'
            for variable in ['GHI', 'BNI']:

                # Getting the values to be plotted
                months, means = query.get_multi_year_monthly_means(variable)

                month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

                # Creating a dictionary with month names as keys and means as values
                data[variable] = {
                    month: float(mean) for month, mean in zip(month_names, means)
                }

            # Write JSON
            multi_year_monthly_means_path.write_text(json.dumps(data, indent=4))

            # --------------------------------------------------------------------------------------------------------------
            # Updating list of files
            # --------------------------------------------------------------------------------------------------------------

            files.append(
                {
                    "path": str(multi_year_monthly_means_path),
                    "friendlyname": "Multi year monthly means JSON",
                    "size": multi_year_monthly_means_path.stat().st_size
                }
            )

    return {
        "success": True,
        "payload": data,
        "files": files
    }


if __name__ == "__main__":
    """
    Entry point for the script. Checks for the correct number of command-line arguments and
    invokes the main function with the provided arguments.

    Usage:
        python your_script.py <lat> <lon> <start_datetime> <end_datetime>
    """
    if len(sys.argv) != 6:
        print("Usage: python your_script.py <lat> <lon> <start_datetime> <end_datetime>")
    else:
        main(float(sys.argv[1]), float(sys.argv[2]), sys.argv[3], sys.argv[4], sys.argv[5])
