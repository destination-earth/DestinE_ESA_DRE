using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using CsvHelper.Configuration.Attributes;
using Microsoft.AspNetCore.Mvc;
using CsvHelper.Configuration;


namespace DataServices.Models;

#region Old DTOs
public class SolarProductionDustRecord
{
    public int Order { get; set; }
    public DateTime Timestamp { get; set; }
    public double Ghi { get; set; }
    public double GhiCorrected { get; set; }
    public double Aot { get; set; }
    public double Production { get; set; }
    public double ProductionCorrected { get; set; }
    public double ReductionPercentage { get; set; }
}

public class WindPredictionCSV
{
    [Name("time_utc")]
    public DateTime TimeUTC { get; set; }
}

public class UploadSettings
{

    [FromForm(Name = "plantkey")]
    public string PlantKey { get; set; }
    
    [FromForm(Name = "datatype")]
    public string DataType { get; set; }

    [FromForm(Name = "keytype")]
    public string KeyType { get; set; }

}


#endregion



#region Wind_Power_Curve
//power_curve.csv
public class WindPowerData // power
{
    public double WindSpeedInMS { get; set; }
    public int PowerOutputInKW { get; set; }
}


// Define the mapping class to map CSV columns to class properties.
public sealed class WindPowerDataMap : ClassMap<WindPowerData>
{
    public WindPowerDataMap()
    {
        // Map the CSV header "wind_speed_in_m_s" to WindSpeedInMS property.
        Map(m => m.WindSpeedInMS).Name("wind_speed_in_m_s");
        // Map the CSV header "power_output_in_kW" to PowerOutputInKW property.
        Map(m => m.PowerOutputInKW).Name("power_output_in_kW");
    }
}

#endregion

#region Wind_Power_Output
//power_output_timeseries.csv
public class PowerWindData
{
    public DateTime DateTime { get; set; }
    public double PowerInKW { get; set; }
    public double WindSpeedInMPerS { get; set; }
    public double WindDirectionInDeg { get; set; }
}


public sealed class PowerWindDataMap : ClassMap<PowerWindData>
{
    public PowerWindDataMap()
    {
        Map(m => m.DateTime).Name("datetime");
        Map(m => m.PowerInKW).Name("power_in_kW");
        Map(m => m.WindSpeedInMPerS).Name("wind_speed_in_m_per_s");
        Map(m => m.WindDirectionInDeg).Name("wind_direction_in_deg");
    }
}

#endregion

#region Wind_Weibul_PDF

public class WeibullData
{
    public double X { get; set; }
    public double WeibullPDF { get; set; }
}

public sealed class WeibullDataMap : ClassMap<WeibullData>
{
    public WeibullDataMap()
    {
        Map(m => m.X).Name("X");
        Map(m => m.WeibullPDF).Name("Weibull PDF");
    }
}

#endregion

#region Wind_speed_histogram_values
public class WindFrequencyData
{
    public double BinStart { get; set; }
    public double BinEnd { get; set; }
    public double Frequency { get; set; }
}

public sealed class WindFrequencyDataMap : ClassMap<WindFrequencyData>
{
    public WindFrequencyDataMap()
    {
        Map(m => m.BinStart).Name("Bin Start");
        Map(m => m.BinEnd).Name("Bin End");
        Map(m => m.Frequency).Name("Frequency");
    }
}
#endregion

#region Wind_Speed_Statistics
public class WindDirectionStatisticsData
{
    public string Direction { get; set; }
    public double FrequencyPercentage { get; set; }
    public double WeibullShape { get; set; }
    public double WeibullScale { get; set; }
    public double MeanWindSpeed { get; set; }
    public double Percentile95 { get; set; }
    public double Percentile97 { get; set; }
    public double Percentile99 { get; set; }
}


public sealed class WindDirectionStatisticsDataMap : ClassMap<WindDirectionStatisticsData>
{
    public WindDirectionStatisticsDataMap()
    {
        Map(m => m.Direction).Name("Direction");
        Map(m => m.FrequencyPercentage).Name("Frequency (%)");
        Map(m => m.WeibullShape).Name("Weibull Shape (k)");
        Map(m => m.WeibullScale).Name("Weibull Scale (c)");
        Map(m => m.MeanWindSpeed).Name("Mean Wind Speed (m/s)");
        Map(m => m.Percentile95).Name("95th Percentile (m/s)");
        Map(m => m.Percentile97).Name("97th Percentile (m/s)");
        Map(m => m.Percentile99).Name("99th Percentile (m/s)");
    }
}

#endregion

#region Wind_speed_timeseries

public class WindSpeedTimeSeriesData
{
    public DateTime DateTime { get; set; }
    public double WindSpeedInMPerS { get; set; }
    public double WindDirectionInDeg { get; set; }
}

public sealed class WindSpeedTimeSeriesDataMap : ClassMap<WindSpeedTimeSeriesData>
{
    public WindSpeedTimeSeriesDataMap()
    {
        Map(m => m.DateTime).Name("datetime");
        Map(m => m.WindSpeedInMPerS).Name("wind_speed_in_m_per_s");
        Map(m => m.WindDirectionInDeg).Name("wind_direction_in_deg");
    }
}

#endregion




