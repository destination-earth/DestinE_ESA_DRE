import numpy as np
import pandas as pd
from datetime import datetime
from typing import Dict, List, Union

def load_power_curve(file_path: str) -> tuple[np.ndarray, np.ndarray]:
    """Load power curve from CSV file with validation"""
    try:
        power_curve_df = pd.read_csv(file_path)
        
        # Validate required columns
        if 'wind_speed_in_m_s' not in power_curve_df.columns:
            raise ValueError("Power curve CSV must contain 'wind_speed_in_m_s' column")
        if 'power_output_in_kW' not in power_curve_df.columns:
            raise ValueError("Power curve CSV must contain 'power_output_in_kW' column")
            
        return (
            power_curve_df['wind_speed_in_m_s'].astype(np.float64).values,
            power_curve_df['power_output_in_kW'].astype(np.float64).values
        )
    except Exception as e:
        raise ValueError(f"Error loading power curve: {str(e)}")

def calculate_power(wind_speed: Union[List[float], np.ndarray], 
                   power_curve_wind: np.ndarray, 
                   power_curve_power: np.ndarray) -> np.ndarray:
    """Calculate power output from wind speed using power curve"""
    try:
        wind_speed = np.asarray(wind_speed, dtype=np.float64)
        return np.interp(wind_speed, power_curve_wind, power_curve_power, left=0, right=0)
    except Exception as e:
        raise ValueError(f"Power calculation failed: {str(e)}")

def calculate_energy_statistics(wind_speed: np.ndarray, 
                               wind_power: np.ndarray, 
                               dates: List[str],
                               power_curve_power: np.ndarray) -> Dict:
    """Calculate all energy-related statistics with robust error handling"""
    try:
        if len(wind_speed) != len(wind_power) or len(wind_speed) != len(dates):
            raise ValueError("All input arrays must have equal lengths")
        # Convert dates to datetime objects
        #datetimes = np.array([datetime.fromisoformat(d) for d in dates])
        # --- Robust Datetime Parsing ---
        def parse_datetime(d: str) -> datetime:
            """Handle both regular ISO and nanosecond-precision timestamps"""
            try:
                if '.' in d and 'Z' not in d:  # Has nanoseconds but no timezone
                    return datetime.strptime(d.split('.')[0], '%Y-%m-%dT%H:%M:%S')
                return datetime.fromisoformat(d.replace('Z', ''))  # Handle Zulu time
            except ValueError as e:
                raise ValueError(f"Failed to parse datetime '{d}': {str(e)}")

        datetimes = np.array([parse_datetime(d) for d in dates])

        # Calculate total days in dataset
        total_days = (datetimes[-1] - datetimes[0]).days + 1
        
        # Histogram parameters
        binWidth = 1
        lastVal = np.round(np.max(wind_speed), 1)
        binEdges = np.arange(0, lastVal + binWidth, binWidth)
        
        # Energy statistics per wind speed bin
        bin_indices = np.digitize(wind_speed, binEdges) - 1
        bin_total_energy_kwh = [
            wind_power[bin_indices == i].sum() 
            for i in range(len(binEdges) - 1)
        ]
        bin_mean_annual_energy = [
            (energy / total_days) * 365 
            for energy in bin_total_energy_kwh
        ]
        
        # Create histogram data
        hist_data = {
            'bin_start_m_s': binEdges[:-1].tolist(),
            'bin_end_m_s': binEdges[1:].tolist(),
            'mean_annual_estimated_energy_kwh': bin_mean_annual_energy
        }
        
        # Power statistics constants
        AIR_DENSITY = 1.225  # kg/m³ at sea level, 15°C
        
        # Create daily statistics
        df_daily = pd.DataFrame({
            'datetime': datetimes,
            'wind_speed': wind_speed,
            'power_kW': wind_power
        })
        df_daily['date'] = df_daily['datetime'].dt.date
        daily_grouped = df_daily.groupby('date').mean(numeric_only=True)
        
        # Annual estimates
        max_power = np.max(power_curve_power)
        annual_stats = {
            'total_energy_potential_kWh': float(wind_power.sum()),
            'avg_power_output_kWh': float(daily_grouped['power_kW'].mean() * 365),
            'capacity_factor_percent': float(
                (daily_grouped['power_kW'] / max_power).mean() * 100
            ),
           # 'annual_avg_wind_speed_m_s': float(daily_grouped['wind_speed'].mean()),
            'avg_wind_power_density_W_m2': float(
                (AIR_DENSITY * daily_grouped['wind_speed']**3 / 2).mean()
            )
           # 'max_power_kW': float(max_power)
        }
        
        return {
            'histogram_data': hist_data,
            'annual_stats': annual_stats
        }
        
    except Exception as e:
        raise ValueError(f"Energy statistics calculation failed: {str(e)}")
