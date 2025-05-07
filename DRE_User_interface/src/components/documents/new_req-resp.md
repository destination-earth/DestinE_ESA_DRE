# API Request and Response Documentation

This document provides a reference for the updated API request and response structures for the assessment and forecast endpoints.

## Assessment Endpoints

### Wind Assessment

#### Basic Wind Assessment

**Endpoint:** `/api/Assessment/wind/basic`

**Request:**

```json
{
  "startDate": "2025-05-01T00:00:00",
  "endDate": "2025-05-03T00:00:00",
  "latitude": 37.9838,
  "longitude": 23.7275,
  "height": 100.0,
  "file_path": "/data/wind/request001.csv",
  "guid": "BGWXLN2K3QHFCM9MU6ZQTW",
  "aux": "2014-01-01|2014-01-02"
}
```

**Key Fields:**

- `startDate`, `endDate`: ISO format date strings
- `latitude`, `longitude`: Coordinates as numbers
- `height`: Hub height in meters
- `file_path`: Path to the validated file on the server (from validation endpoint)
- `guid`: Unique identifier for the request (from validation endpoint)
- `aux`: Optional auxiliary information (from validation endpoint)

#### Premium Wind Assessment

**Endpoint:** `/api/Assessment/wind/premium`

**Request:**

```json
{
  "startDate": "2025-05-01T00:00:00",
  "endDate": "2025-05-03T00:00:00",
  "latitude": 37.9838,
  "longitude": 23.7275,
  "height": 100.0,
  "file_path": "/data/wind/request001.csv",
  "guid": "BGWXLN2K3QHFCM9MU6ZQTW",
  "aux": "2014-01-01|2014-01-02",
  "hub_height": 120.0,
  "curve_model": "custom/vestas etc"
}
```

**Additional Fields:**

- `hub_height`: Hub height in meters (renamed from `hubHeight`)
- `curve_model`: Power curve model name or 'custom' (renamed from `powerCurveModel`)

### Solar Assessment

#### Basic Solar Assessment

**Endpoint:** `/api/Assessment/solar/basic`

**Request:**

```json
{
  "startDate": "2025-06-01T00:00:00",
  "endDate": "2025-06-30T00:00:00",
  "latitude": 34.0522,
  "longitude": -118.2437,
  "file_path": "/data/solar/request_solar_basic.csv",
  "guid": "987e6543-e21b-34d3-c456-123456789abc",
  "aux": "solar-data-optional-info"
}
```

**Key Fields:**

- Same as wind basic assessment, but without the `height` field

#### Premium Solar Assessment

**Endpoint:** `/api/Assessment/solar/premium`

**Request:**

```json
{
  "startDate": "2025-07-01T00:00:00",
  "endDate": "2025-07-31T00:00:00",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "file_path": "/data/solar/premium_request_july.csv",
  "guid": "321fba76-9cba-43fe-b7cd-001122334455",
  "aux": "additional-premium-params",
  "tilt": 30,
  "azimuth": 180.0,
  "tracking": 1,
  "capacity": 5.5
}
```

**Additional Fields:**

- `tilt`: Panel tilt angle in degrees
- `azimuth`: Panel azimuth angle in degrees (0-360)
- `tracking`: Tracking type (0: fixed, 1: single-axis, 2: dual-axis)
- `capacity`: Capacity in kW

## Forecast Endpoints

### Wind Forecast

#### Basic Wind Forecast

**Endpoint:** `/api/Forecast/wind/basic`

**Request:**

```json
{
  "latitude": 51.5074,
  "longitude": -0.1278,
  "hubheight": 100,
  "filename": "london_wind_forecast.csv",
  "train_data": "/data/wind/training/london2024.csv",
  "guid": "999a888b-777c-666d-555e-444f33332222",
  "aux": "forecast-v2-modeling",
  "powerCurveModel": "GE-3.8-130",
  "capacity": 3.8
}
```

**Key Fields:**

- `latitude`, `longitude`: Coordinates as numbers
- `hubheight`: Hub height in meters (note: snake_case)
- `filename`: Original filename
- `train_data`: Path to the validated training data file (from validation endpoint)
- `guid`: Unique identifier (from validation endpoint)
- `aux`: Optional auxiliary information (from validation endpoint)
- `powerCurveModel`: Power curve model name
- `capacity`: Capacity in MW

#### Premium Wind Forecast

**Endpoint:** `/api/Forecast/wind/premium`

**Request:**

```json
{
  "latitude": 51.5074,
  "longitude": -0.1278,
  "hubheight": 100,
  "filename": "london_wind_forecast.csv",
  "train_data": "/data/wind/training/london2024.csv",
  "guid": "999a888b-777c-666d-555e-444f33332222",
  "aux": "forecast-v2-modeling",
  "powerCurveModel": "GE-3.8-130",
  "capacity": 3.8
}
```

**Key Fields:**

- Same as basic wind forecast

### Solar Forecast

#### Basic Solar Forecast

**Endpoint:** `/api/Forecast/solar/basic`

**Request:**

```json
{
  "latitude": 48.8566,
  "longitude": 2.3522,
  "elevation": 35.0,
  "filename": "paris_forecast_july.csv",
  "file_path": "/data/solar/forecasts/paris_july.csv",
  "guid": "abc12345-def6-7890-gh12-ijkl34567890",
  "aux": "forecast-run-with-tracking",
  "tilt": 25.0,
  "azimuth": 170.0,
  "tracking": 1.0,
  "capacity": 10.0
}
```

**Key Fields:**

- `latitude`, `longitude`: Coordinates as numbers
- `elevation`: Elevation in meters
- `filename`: Original filename
- `file_path`: Path to the validated file (from validation endpoint)
- `guid`: Unique identifier (from validation endpoint)
- `aux`: Optional auxiliary information (from validation endpoint)
- `tilt`: Panel tilt angle in degrees
- `azimuth`: Panel azimuth angle in degrees
- `tracking`: Tracking type (0: fixed, 1: single-axis, 2: dual-axis)
- `capacity`: Capacity in kW

#### Premium Solar Forecast

**Endpoint:** `/api/Forecast/solar/premium`

**Request:**

```json
{
  "latitude": 48.8566,
  "longitude": 2.3522,
  "elevation": 35.0,
  "filename": "paris_forecast_july.csv",
  "file_path": "/data/solar/forecasts/paris_july.csv",
  "guid": "abc12345-def6-7890-gh12-ijkl34567890",
  "aux": "forecast-run-with-tracking",
  "tilt": 25.0,
  "azimuth": 170.0,
  "tracking": 1.0,
  "capacity": 10.0
}
```

**Key Fields:**

- Same as basic solar forecast

## File Validation Endpoints

### Wind File Validation

**Endpoint:** `/api/Forecast/wind/validatefile`

**Response:**

```json
{
  "valid": true,
  "message": "File validation successful",
  "file_path": "/data/wind/training/london2024.csv",
  "guid": "999a888b-777c-666d-555e-444f33332222",
  "aux": "forecast-v2-modeling",
  "filename": "london_wind_forecast.csv"
}
```

**Key Fields:**

- `valid`: Boolean indicating if validation was successful
- `message`: Validation message or error
- `file_path`: Path to the validated file on the server
- `guid`: Unique identifier generated by the server
- `aux`: Optional auxiliary information
- `filename`: Original filename

### Solar File Validation

**Endpoint:** `/api/Forecast/solar/validatefile`

**Response:**

```json
{
  "valid": true,
  "message": "File validation successful",
  "file_path": "/data/solar/forecasts/paris_july.csv",
  "guid": "abc12345-def6-7890-gh12-ijkl34567890",
  "aux": "forecast-run-with-tracking",
  "filename": "paris_forecast_july.csv"
}
```

**Key Fields:**

- Same as wind file validation

## Implementation Notes

1. **Field Naming Conventions:**
   - Backend uses snake_case for some fields (e.g., `file_path`, `hub_height`)
   - Some fields remain in camelCase (e.g., `powerCurveModel`)
   - Be consistent with the exact field names expected by each endpoint

2. **File Validation Flow:**
   - Upload file to validation endpoint first
   - Receive validation response with `file_path`, `guid`, etc.
   - Include these fields in subsequent assessment/forecast requests

3. **Empty String Handling:**
   - For fields that are not applicable, use empty strings (`""`) rather than omitting them
   - Example: `"file_path": ""` when no file is needed

4. **Type Conversions:**
   - Ensure numeric values are sent as numbers, not strings
   - Convert date strings to ISO format using `new Date().toISOString()'
