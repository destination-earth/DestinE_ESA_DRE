from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import pandas as pd
import datetime
import os
from typing import List, Dict

app = FastAPI(title="CSV Validation API")

# Expected column names
EXPECTED_COLUMNS = ["time_utc", "total_production_active_power_kW"]
POWER_COLUMN = "total_production_active_power_kW"

class ValidationError:
    def __init__(self, row_number: int, column: str, error_type: str, message: str):
        self.row_number = row_number
        self.column = column
        self.error_type = error_type
        self.message = message
    
    def to_dict(self):
        return {
            "row_number": self.row_number,
            "column": self.column,
            "error_type": self.error_type,
            "message": self.message
        }

def get_container_path(input_path: str) -> str:
    """Simple function to convert any path to container path"""
    # If already a container path, return as is
    if input_path.startswith('/app/'):
        return input_path
        
    # Extract just the filename from the path
    filename = os.path.basename(input_path)
    
    # Return the container path
    return f"/app/data/{filename}"

def validate_csv_file(file_path: str) -> List[ValidationError]:
    """Validates a CSV file according to the specified rules"""
    errors = []
    
    # Convert to container path
    container_path = get_container_path(file_path)
    print(f"Using container path: {container_path}")
    
    # Basic file checks
    if not os.path.exists(container_path):
        errors.append(ValidationError(0, "file", "file_not_found", f"File not found at {container_path}"))
        return errors
    
    if not container_path.endswith('.csv'):
        errors.append(ValidationError(0, "file", "invalid_file_type", "File must be a CSV"))
        return errors
    
    # Read CSV file
    try:
        df = pd.read_csv(container_path)
    except Exception as e:
        errors.append(ValidationError(0, "file", "invalid_csv_format", f"Invalid CSV format: {str(e)}"))
        return errors
    
    # Validate column names
    missing_columns = [col for col in EXPECTED_COLUMNS if col not in df.columns]
    if missing_columns:
        for col in missing_columns:
            errors.append(ValidationError(0, "headers", "missing_column", f"Required column '{col}' is missing"))
        return errors
    
    # Check for empty cells
    for col in EXPECTED_COLUMNS:
        null_indices = df[df[col].isnull()].index
        for idx in null_indices:
            errors.append(ValidationError(idx + 1, col, "empty_cell", f"Empty cell found"))
    
    # Validate power values - must be numeric and within range
    # Convert to numeric, coerce errors to NaN
    df[POWER_COLUMN] = pd.to_numeric(df[POWER_COLUMN], errors='coerce')
    
    # Check for non-numeric values (now NaN)
    non_numeric_indices = df[df[POWER_COLUMN].isna()].index
    for idx in non_numeric_indices:
        errors.append(ValidationError(idx + 1, POWER_COLUMN, "invalid_value", f"Non-numeric value found"))
    
    # Check for values outside allowed range
    invalid_range_indices = df[(df[POWER_COLUMN] < 0) | (df[POWER_COLUMN] >= 100000)].index
    for idx in invalid_range_indices:
        errors.append(ValidationError(idx + 1, POWER_COLUMN, "out_of_range_value", 
                             f"Value {df.loc[idx, POWER_COLUMN]} is out of allowed range [0, 100000)"))
    
    # Process timestamps - WITHOUT timezone handling
    # Just check if they can be parsed as datetime
    try:
        # Convert to datetime but don't worry about timezone
        df['time_utc_parsed'] = pd.to_datetime(df['time_utc'], errors='coerce')
        
        # Check for invalid formats (will be NaT)
        invalid_time_indices = df[df['time_utc_parsed'].isna()].index
        for idx in invalid_time_indices:
            errors.append(ValidationError(idx + 1, "time_utc", "invalid_timestamp_format", 
                                 f"Invalid timestamp format: {df.loc[idx, 'time_utc']}"))
        
        # Remove rows with invalid timestamps
        df = df.dropna(subset=['time_utc_parsed'])
        
        if len(df) == 0:
            return errors
            
        # Check for future timestamps (simple comparison, no timezone)
        # Convert timestamps to naive to avoid timezone comparison issues
        if df['time_utc_parsed'].dt.tz is not None:
            # If timestamps have timezone, extract values as naive datetimes
            current_time = datetime.datetime.now()
            df['time_utc_naive'] = df['time_utc_parsed'].dt.tz_localize(None)
            
            # Use naive timestamps for all comparisons
            future_indices = df[df['time_utc_naive'] > current_time].index
            for idx in future_indices:
                errors.append(ValidationError(idx + 1, "time_utc", "future_timestamp",
                                     f"Future timestamp detected: {df.loc[idx, 'time_utc']}"))
            
            # Check for timestamps newer than 3 days before current date
            min_allowed_time = current_time - datetime.timedelta(days=3)
            recent_indices = df[df['time_utc_naive'] > min_allowed_time].index
            for idx in recent_indices:
                errors.append(ValidationError(idx + 1, "time_utc", "too_recent_timestamp",
                                     f"Timestamp {df.loc[idx, 'time_utc']} is newer than 3 days before current date"))
        else:
            # If timestamps are already naive, compare directly
            current_time = datetime.datetime.now()
            future_indices = df[df['time_utc_parsed'] > current_time].index
            for idx in future_indices:
                errors.append(ValidationError(idx + 1, "time_utc", "future_timestamp",
                                     f"Future timestamp detected: {df.loc[idx, 'time_utc']}"))
            
            # Check for timestamps newer than 3 days before current date
            min_allowed_time = current_time - datetime.timedelta(days=3)
            recent_indices = df[df['time_utc_parsed'] > min_allowed_time].index
            for idx in recent_indices:
                errors.append(ValidationError(idx + 1, "time_utc", "too_recent_timestamp",
                                     f"Timestamp {df.loc[idx, 'time_utc']} is newer than 3 days before current date"))
        
        # Handle duplicate timestamps - drop duplicates
        df_no_dups = df.drop_duplicates(subset=['time_utc_parsed'])
        if len(df_no_dups) < len(df):
            dup_count = len(df) - len(df_no_dups)
            print(f"Found {dup_count} duplicate timestamp rows")
            df = df_no_dups
        
        # Check timestamp intervals
        if len(df) > 1:
            # Sort by timestamp
            df = df.sort_values('time_utc_parsed')
            
            # Calculate time differences without timezone complexities
            df['time_diff'] = df['time_utc_parsed'].diff()
            expected_interval = pd.Timedelta(minutes=15)
            
            # Find incorrect intervals (excluding NaN for first row)
            invalid_intervals = df[(df['time_diff'] != expected_interval) & (df['time_diff'].notna())].index
            
            # Only flag interval issues during daytime
            for idx in invalid_intervals:
                timestamp = df.loc[idx, 'time_utc_parsed']
                
                # Skip nighttime (8 PM to 6 AM) interval checks
                hour = timestamp.hour
                if hour >= 6 and hour < 20:  # Only check during daytime
                    errors.append(ValidationError(idx + 1, "time_utc", "invalid_timestamp_interval",
                                             f"Invalid time interval during daytime hours"))
        
    except Exception as e:
        # If any timestamp processing fails, report it
        print(f"Error processing timestamps: {str(e)}")
        errors.append(ValidationError(0, "time_utc", "timestamp_processing_error", 
                             f"Error in timestamp processing: {str(e)}"))
    
    return errors

@app.post("/validate-csv")
async def validate_csv(request: Request):
    """
    Endpoint to validate a CSV file.
    Simply send the file path in the request body.
    """
    try:
        # Get the body content as text
        body = await request.body()
        file_path = body.decode("utf-8").strip()
        
        # If it's JSON, extract the file_path field
        if file_path.startswith('{') and file_path.endswith('}'):
            import json
            try:
                data = json.loads(file_path)
                if "file_path" in data:
                    file_path = data["file_path"]
            except:
                pass  # If JSON parsing fails, use the raw input
        
        print(f"Received path: {file_path}")
        
        # Validate the CSV file
        errors = validate_csv_file(file_path)
        
        if errors:
            return JSONResponse(
                status_code=400,
                content={
                    "valid": False,
                    "errors": [error.to_dict() for error in errors],
                    "message": "CSV validation failed. Please correct the errors and try again."
                }
            )
        
        # If no errors, return the container path where the validated file is located
        container_path = get_container_path(file_path)
        
        return JSONResponse(
            status_code=200,
            content={
                "valid": True,
                "message": "CSV validation passed. All checks successful.",
                "file_path": container_path
            }
        )
    except Exception as e:
        print(f"Error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "valid": False,
                "message": f"Server error: {str(e)}"
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)