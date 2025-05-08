import sys
import json
import numpy as np
from scipy import stats

def compute_wind_statistics(wind_speed, wind_direction):
    """Compute wind statistics including Weibull parameters, mean, and percentiles"""
    n_bins = 16
    bin_edges = np.array([11.25, 33.75, 56.25, 78.75, 101.25, 123.75, 146.25, 168.75,
                        191.25, 213.75, 236.25, 258.75, 281.25, 303.75, 326.25, 348.75])
    directions = ['NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S',
                 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N']

    # Bin wind directions
    wind_direction_bins = np.digitize(wind_direction, bin_edges, right=False)
    wind_direction_bins[(wind_direction >= 348.75) | (wind_direction < 11.25)] = 16

    stats_data = []
    total_samples = len(wind_speed)
    
    # Initialize Weibull variables
    xgrid = np.array([])
    pdfEst = np.array([])
    shape, scale = np.nan, np.nan
    
    # Initialize frequency distribution variables
    freq_wind_speed = []
    count_wind_speed = []
    
    # Initialize rose diagram data
    speed_ranges = [
        {"label": "0-5 m/s", "min": 0, "max": 5},
        {"label": "5-10 m/s", "min": 5, "max": 10},
        {"label": "10-15 m/s", "min": 10, "max": 15},
        {"label": "15-20 m/s", "min": 15, "max": 20},
        {"label": "20-25 m/s", "min": 20, "max": 25},
        {"label": ">25 m/s", "min": 25, "max": np.inf}
    ]
    rose_data = []

    if total_samples > 0:
        # Weibull fitting for all directions
        try:
            shape, loc, scale = stats.weibull_min.fit(wind_speed, floc=0)
            xgrid = np.linspace(0, np.max(wind_speed), 100)
            pdfEst = stats.weibull_min.pdf(xgrid, shape, loc=0, scale=scale)
        except Exception:
            shape, scale = np.nan, np.nan
            xgrid = np.linspace(0, np.max(wind_speed) if len(wind_speed) > 0 else 0, 100)
            pdfEst = np.zeros_like(xgrid)

        # Create count_wind_speed (Weibull PDF)
        count_wind_speed = [{"X": float(x), "pdf": float(p)} for x, p in zip(xgrid, pdfEst)]

        # Create frequency distribution (1 m/s bins)
        max_speed = int(np.ceil(np.max(wind_speed))) if len(wind_speed) > 0 else 0
        bins = np.arange(0, max_speed + 2)
        hist, bin_edges = np.histogram(wind_speed, bins=bins)
        frequencies = hist / total_samples
        
        freq_wind_speed = []
        for speed, freq in zip(bins[:-1], frequencies):
            freq_wind_speed.append({
                "speed": int(speed),
                "frequency": float(freq)
            })

        # Calculate rose diagram data
        for speed_range in speed_ranges:
            range_mask = (wind_speed >= speed_range["min"]) & (wind_speed < speed_range["max"])
            speeds_in_range = wind_speed[range_mask]
            dirs_in_range = wind_direction_bins[range_mask]
            
            if len(speeds_in_range) > 0:
                # Count directions in this speed range
                dir_counts = np.zeros(n_bins)
                for i in range(n_bins):
                    dir_counts[i] = np.sum(dirs_in_range == (i + 1))
                
                # Convert to frequencies
                dir_frequencies = (dir_counts / len(speeds_in_range)) * 100
            else:
                dir_frequencies = np.zeros(n_bins)
            
            rose_data.append({
                "label": speed_range["label"],
                "data": [float(freq) for freq in dir_frequencies]
            })

        mean_wind_speed = np.mean(wind_speed)
        p95, p97, p99 = np.percentile(wind_speed, [95, 97, 99])

        stats_data.append({
            "direction": "All directions",
            "frequency": 100.0,
            "weibull_shape": float(shape),
            "weibull_scale": float(scale),
            "mean": float(mean_wind_speed),
            "nine_five": float(p95),
            "nine_seven": float(p97),
            "nine_nine": float(p99)
        })

    for i in range(n_bins):
        bin_mask = wind_direction_bins == (i + 1)
        wind_speeds_in_bin = wind_speed[bin_mask]
        bin_count = np.sum(bin_mask)

        if bin_count > 0:
            frequency = (bin_count / total_samples) * 100
            if bin_count < 50:
                stats_data.append({
                    "direction": directions[i],
                    "frequency": float(frequency),
                    "weibull_shape": None,
                    "weibull_scale": None,
                    "mean": round(float(np.mean(wind_speeds_in_bin)), 2),
                    "nine_five": round(float(np.percentile(wind_speeds_in_bin, 95)), 2),
                    "nine_seven": round(float(np.percentile(wind_speeds_in_bin, 97)), 2),
                    "nine_nine": round(float(np.percentile(wind_speeds_in_bin, 99)), 2)
                })
            else:
                try:
                    shape_bin, loc_bin, scale_bin = stats.weibull_min.fit(wind_speeds_in_bin, floc=0)
                except Exception:
                    shape_bin, scale_bin = np.nan, np.nan

                stats_data.append({
                    "direction": directions[i],
                    "frequency": round(float(frequency), 2),
                    "weibull_shape": round(float(shape_bin), 2),
                    "weibull_scale": round(float(scale_bin), 2),
                    "mean": round(float(np.mean(wind_speeds_in_bin)), 2),
                    "nine_five": round(float(np.percentile(wind_speeds_in_bin, 95)), 2),
                    "nine_seven": round(float(np.percentile(wind_speeds_in_bin, 97)), 2),
                    "nine_nine": round(float(np.percentile(wind_speeds_in_bin, 99)), 2)
                })
        else:
            stats_data.append({
                "direction": directions[i],
                "frequency": 0.0,
                "weibull_shape": None,
                "weibull_scale": None,
                "mean": None,
                "nine_five": None,
                "nine_seven": None,
                "nine_nine": None
            })

    return {
        "wind_statistics_record": stats_data,
        "count_wind_speed": count_wind_speed,
        "freq_wind_speed": freq_wind_speed,
        "rose_diagram": {
            "directions": directions,
            "windspeedrange": rose_data
        }
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing input file"}))
        sys.exit(1)

    try:
        with open(sys.argv[1]) as f:
            data = json.load(f)

        # Collect all data
        all_speeds = []
        all_directions = []
        all_dates = []
        job_key = ""

        for chunk in data:
            all_speeds.extend(chunk["wind_speed"])
            all_directions.extend(chunk["wind_direction"])
            all_dates.extend(chunk["dates"])
            job_key = chunk.get("job_key", job_key)

        # Convert to numpy arrays
        wind_speed = np.array(all_speeds)
        wind_direction = np.array(all_directions)

        # Compute statistics
        results = compute_wind_statistics(wind_speed, wind_direction)

        # Prepare output
        output = {
            "job_key": job_key,
            # "dates": all_dates,  # commented out as in original
            "wind_speed": all_speeds,
            "wind_direction": all_directions,
            **results
        }

        print(json.dumps(output, indent=2))

    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "type": type(e).__name__
        }))
        sys.exit(1)
