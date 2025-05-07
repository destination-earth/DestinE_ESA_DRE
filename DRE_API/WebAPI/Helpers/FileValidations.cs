using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace WebApi.Helpers
{

    public class CsvValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();

        public DateTimeOffset? FirstDate { get; set; }
        public DateTimeOffset? LastDate { get; set; }
    }

 

    public class FileValidations
    {
        private readonly string[] ExpectedHeadersWindPowerCurve = ["wind_speed_in_m_s", "power_output_in_kW"];
        private readonly string[] ExpectedHeadersWindTrainData = ["datetime", "power_in_kW", "wind_speed_in_m_per_s", "wind_direction_in_deg"];
        private readonly string[] ExpectedHeadersSolarPowerData = ["time_utc", "total_production_active_power_kW"];


        public CsvValidationResult ValidateWindPowerCurve(string csvContent)
        {
            var result = new CsvValidationResult();
            var lines = csvContent.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

            if (lines.Length < 2)
            {
                result.IsValid = false;
                result.Errors.Add("CSV must have a header and at least one data row.");
                return result;
            }

            // Header check
            var header = lines[0].Split(',');
            if (!header.SequenceEqual(ExpectedHeadersWindPowerCurve))
            {
                result.IsValid = false;
                result.Errors.Add($"Invalid headers. Expected: {string.Join(", ", ExpectedHeadersWindPowerCurve)}");
                return result;
            }

            // Data row checks
            for (int i = 1; i < lines.Length; i++)
            {
                var parts = lines[i].Split(',');
                if (parts.Length != 2)
                {
                    result.Errors.Add($"Row {i + 1} does not have exactly 2 values.");
                    continue;
                }

                if (!double.TryParse(parts[0], NumberStyles.Float, CultureInfo.InvariantCulture, out var windSpeed))
                {
                    result.Errors.Add($"Row {i + 1}: '{parts[0]}' is not a valid number for wind speed.");
                }
                else if (windSpeed < 0)
                {
                    result.Errors.Add($"Row {i + 1}: Wind speed must be a positive number.");
                }

                if (!double.TryParse(parts[1], NumberStyles.Float, CultureInfo.InvariantCulture, out var powerOutput))
                {
                    result.Errors.Add($"Row {i + 1}: '{parts[1]}' is not a valid number for power output.");
                }
                else if (powerOutput < 0)
                {
                    result.Errors.Add($"Row {i + 1}: Power output must be a positive number.");
                }
            }

            result.IsValid = result.Errors.Count == 0;
            return result;
        }

        public CsvValidationResult ValidateWindTrainData(string csvContent)
        { 
            var result = new CsvValidationResult();
            

            var lines = csvContent.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

            if (lines.Length < 2)
            {
                result.Errors.Add("CSV must include a header and at least one data row.");
                return result;
            }

            // Header check
            var header = lines[0].Split(',');
            if (!header.SequenceEqual(ExpectedHeadersWindTrainData))
            {
                result.Errors.Add($"Invalid headers. Expected: {string.Join(", ", ExpectedHeadersWindTrainData)}");
                return result;
            }

            DateTime? previousTime = null;

            for (int i = 1; i < lines.Length; i++)
            {
                var parts = lines[i].Split(',');

                if (parts.Length != 4)
                {
                    result.Errors.Add($"Row {i + 1}: expected 4 values but found {parts.Length}.");
                    continue;
                }

                // datetime
                if (!DateTime.TryParse(parts[0], out var currentTime))
                {
                    result.Errors.Add($"Row {i + 1}: '{parts[0]}' is not a valid datetime.");
                }
                else if (previousTime != null && currentTime != previousTime.Value.AddHours(1))
                {
                    result.Errors.Add($"Row {i + 1}: datetime '{parts[0]}' is not exactly 1 hour after previous time '{previousTime.Value:yyyy-MM-dd HH:mm:ss}'.");
                }

                previousTime = currentTime;

                // power_in_kW
                if (!double.TryParse(parts[1], NumberStyles.Float, CultureInfo.InvariantCulture, out var power) || power < 0)
                {
                    result.Errors.Add($"Row {i + 1}: '{parts[1]}' is not a valid positive power_in_kW.");
                }

                // wind_speed_in_m_per_s
                if (!double.TryParse(parts[2], NumberStyles.Float, CultureInfo.InvariantCulture, out var speed) || speed < 0)
                {
                    result.Errors.Add($"Row {i + 1}: '{parts[2]}' is not a valid positive wind_speed_in_m_per_s.");
                }

                // wind_direction_in_deg
                if (!double.TryParse(parts[3], NumberStyles.Float, CultureInfo.InvariantCulture, out var direction) || direction < 0)
                {
                    result.Errors.Add($"Row {i + 1}: '{parts[3]}' is not a valid positive wind_direction_in_deg.");
                }
            }

            result.IsValid = result.Errors.Count == 0;
            return result;
        }


        public CsvValidationResult ValidateSolarProductionTimeSeries(string csvContent, bool checkInterval = false, int? expectedMinutes = null)
        {
            var result = new CsvValidationResult();
           

            var lines = csvContent.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
            if (lines.Length < 2)
            {
                result.Errors.Add("CSV must include a header and at least one data row.");
                return result;
            }

            var header = lines[0].Split(',');
            if (!header.SequenceEqual(ExpectedHeadersSolarPowerData))
            {
                result.Errors.Add($"Invalid headers. Expected: {string.Join(", ", ExpectedHeadersSolarPowerData)}");
                return result;
            }

            DateTimeOffset? previousTime = null;

            for (int i = 1; i < lines.Length; i++)
            {
                var parts = lines[i].Split(',');

                if (parts.Length != 2)
                {
                    result.Errors.Add($"Row {i + 1}: expected 2 values, found {parts.Length}.");
                    continue;
                }

                if (!DateTimeOffset.TryParse(parts[0], out var currentTime))
                {
                    result.Errors.Add($"Row {i + 1}: '{parts[0]}' is not a valid datetime with offset.");
                    continue;
                }

                if (!double.TryParse(parts[1], NumberStyles.Float, CultureInfo.InvariantCulture, out var power) || power < 0)
                {
                    result.Errors.Add($"Row {i + 1}: '{parts[1]}' is not a valid positive number for total production.");
                    continue;
                }

                if (i == 1) result.FirstDate = currentTime;
                result.LastDate = currentTime;

                if (previousTime != null)
                {
                    if (currentTime < previousTime.Value)
                    {
                        result.Errors.Add($"Row {i + 1}: timestamp '{currentTime}' is not in ascending order.");
                    }

                    if (checkInterval && expectedMinutes.HasValue)
                    {
                        var actualDiff = currentTime - previousTime.Value;
                        if (actualDiff.TotalMinutes != expectedMinutes.Value)
                        {
                            result.Errors.Add($"Row {i + 1}: expected interval {expectedMinutes.Value} min, found {actualDiff.TotalMinutes} min between '{previousTime}' and '{currentTime}'.");
                        }
                    }
                }

                previousTime = currentTime;
            }

            result.IsValid = result.Errors.Count == 0;
            return result;
        }

    }
}
