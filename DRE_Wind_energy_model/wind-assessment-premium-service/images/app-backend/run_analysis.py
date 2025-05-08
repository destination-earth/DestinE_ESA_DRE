import sys
import json
import pandas as pd
import numpy as np
import os
from compute_wind_statistics import compute_wind_statistics
from power_calculations import (load_power_curve, 
                               calculate_power,
                               calculate_energy_statistics)

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Need both wind data CSV and power curve file"}))
        sys.exit(1)

    try:
        csv_path = sys.argv[1]
        power_curve_path = sys.argv[2]
        start_date_str = sys.argv[3]
        end_date_str = sys.argv[4]

        # Convert start and end dates to datetime objects
        start_date = pd.to_datetime(start_date_str,utc=True)
        end_date = pd.to_datetime(end_date_str,utc=True)
        # Load data
        df = pd.read_csv(sys.argv[1])
        if df.empty:
            raise ValueError("Empty CSV file provided")
            
        df['datetime'] = pd.to_datetime(df['datetime'],utc=True)
        df = df[(df['datetime'] >= start_date) & (df['datetime'] <= end_date)]
        df = df.sort_values('datetime')
        
        # Prepare JSON structure
        data = {
            "job_key": os.path.basename(os.path.dirname(sys.argv[1])),
            "dates": df['datetime'].dt.strftime('%Y-%m-%dT%H:%M:%SZ').tolist(),
            "wind_speed": df['wind_speed'].tolist(),
            "wind_direction": df['wind_direction'].tolist()
        }

        # Existing analysis pipeline
        pc_wind, pc_power = load_power_curve(sys.argv[2])
        wind_stats = compute_wind_statistics(
            np.array(data["wind_speed"]),
            np.array(data["wind_direction"])
        )
        power_output = calculate_power(
            np.array(data["wind_speed"]),
            pc_wind, pc_power
        )
        energy_stats = calculate_energy_statistics(
            np.array(data["wind_speed"]),
            power_output,
            data["dates"],
            pc_power
        )

        # Prepare time series combined data
        combined_time_series = [{
            "datetime": dt,
            "power_kW": float(p),
            "wind_speed": float(s),
            "wind_direction": float(wd)
        } for dt, p, s, wd in zip(
            data["dates"],
            power_output,
            data["wind_speed"],
            data["wind_direction"]
        )]

        # Save time series to CSV
        df = pd.DataFrame(combined_time_series)
        df['datetime'] = pd.to_datetime(df['datetime'])
        df = df.sort_values('datetime')
        df = df.drop_duplicates(subset='datetime', keep='first')

        results_dir = f"/app/data/assessment/results/{data['job_key']}"
        os.makedirs(results_dir, exist_ok=True)
        
        csv_path = f"{results_dir}/results.csv"
        df.to_csv(csv_path, index=False)
        print(f"Time series saved to CSV at: {csv_path}")

        # Prepare combined output
        output = {
            "job_key": data["job_key"],
            "wind_statistics": wind_stats,
            "power_statistics": energy_stats,
            "time_series": combined_time_series
        }

        # Save the combined output as JSON
        json_path = f"{results_dir}/results.json"
        with open(json_path, 'w') as json_file:
            json.dump(output, json_file, indent=4)
        print(f"Output saved to JSON at: {json_path}")

        # Final output
        print(json.dumps(output))

    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "type": type(e).__name__
        }), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

