using System.Collections.Generic;
using System.Text.Json.Serialization;
using System;


namespace DataServices.Models;

#region Solar Specific DTOs

public class SolarBasicRequest
{
    [JsonPropertyName("startDate")]
    public DateTime startDate { get; set; }

    [JsonPropertyName("endDate")]
    public DateTime endDate { get; set; }

    [JsonPropertyName("latitude")]
    public double latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double longitude { get; set; }

    [JsonPropertyName("file_path")]
    public string file_path { get; set; }

    [JsonPropertyName("guid")]
    public string guid { get; set; }

    [JsonPropertyName("aux")]
    public string aux { get; set; }
}

public class SolarPremiumRequest: SolarBasicRequest
{
    [JsonPropertyName("tilt")]
    public int tilt { get; set; }

    [JsonPropertyName("azimuth")]
    public double azimuth { get; set; }

    [JsonPropertyName("tracking")]
    public int tracking { get; set; }

    [JsonPropertyName("capacity")]
    public double capacity { get; set; }
}

public class SolarBasicResponse
{
    [JsonPropertyName("ghi")]
    public List<ValueMonth> ghi { get; set; }

    [JsonPropertyName("dni")]
    public List<ValueMonth> dni { get; set; }

    [JsonPropertyName("csv_link")]
    public string[] csvLink { get; set; }

    [JsonPropertyName("power_output")]
    public List<DateValue> poweroutput { get; set; }

    [JsonPropertyName("job_type")]
    public string jobtype { get; set; }

}

public class SolarPremiumResponse: SolarBasicResponse
{

    [JsonPropertyName("output_power")]
    public List<ValueMonth> outputPower { get; set; }

    [JsonPropertyName("output_power_hour")]
    public List<SolarDataResponseRecords> outputPowerHour { get; set; }
}

#endregion


#region Wind Specific DTOs



public class WindBasicRequest
{
    [JsonPropertyName("startDate")]
    public DateTime startDate { get; set; }

    [JsonPropertyName("endDate")]
    public DateTime endDate { get; set; }

    [JsonPropertyName("latitude")]
    public double latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double longitude { get; set; }

    [JsonPropertyName("height")]
    public double height { get; set; }


    [JsonPropertyName("file_path")]
    public string file_path { get; set; }

    [JsonPropertyName("guid")]
    public string guid { get; set; }

    [JsonPropertyName("aux")]
    public string aux { get; set; }

    [JsonPropertyName("curve_model")]
    public string curveModel { get; set; }
}


public class WindPremiumRequest:WindBasicRequest
{
    [JsonPropertyName("hub_height")]
    public double hubHeight { get; set; }


}

 
public class WindBasicResponse
{
    [JsonPropertyName("count_wind_speed")]
    public List<XYValues> CountWindSpeed { get; set; }

    [JsonPropertyName("directiona_stat_output")]
    public List<DirectionalOutput> directionalOutputs { get; set; }

    [JsonPropertyName("rose_diagram")]
    public RoseDiagramData roseDiagram { get; set; } // a json inside here?

    [JsonPropertyName("csv_link")]
    public string[] csvLink { get; set; }

    [JsonPropertyName("job_type")]
    public string jobtype { get; set; }


    [JsonPropertyName("complex")]
    public List<WindBasicResponseComplex> complex { get; set; }

    [JsonPropertyName("annual_stats")]
    public AnnualStats annual_stats { get; set; }

}


public class WindBasicResponseComplex
{
    [JsonPropertyName("datetime")]
    public string datetime { get; set; }

    [JsonPropertyName("power_in_kW")]
    public double? power_in_kW { get; set; }

    [JsonPropertyName("wind_speed_in_m_per_s")]
    public double wind_speed_in_m_per_s { get; set; }

    [JsonPropertyName("wind_direction_in_deg")]
    public double wind_direction_in_deg { get; set; }
}




public class RoseDiagramData
{
    [JsonPropertyName("directions")]
    public string[] directions { get; set; }

    [JsonPropertyName("windspeedrange")]
    public List<WindSpeedRange> windSpeedRange { get; set; }

}

public class WindSpeedRange
{
    [JsonPropertyName("label")]
    public string Label { get; set; }

    [JsonPropertyName("data")]
    public double[] Data { get; set; }
}


public class WindPremiumResponse : WindBasicResponse
{

    [JsonPropertyName("output_power")]
    public List<ValueMonth> outputPower { get; set; } //was Date/Value but the Figma has months...
}


public class DirectionalOutput
{

    [JsonPropertyName("direction")]
    public string direction { get; set; }

    [JsonPropertyName("frequency")]
    public double? frequency { get; set; }

    [JsonPropertyName("weibull_shape")]
    public double? weibullShape { get; set; }

    [JsonPropertyName("weibull_scale")]
    public double? weibullScale { get; set; }

    [JsonPropertyName("mean")]
    public double? mean { get; set; }

    [JsonPropertyName("nine_five")]
    public double? nineFive { get; set; }

    [JsonPropertyName("nine_seven")]
    public double? nineSeven { get; set; }

    [JsonPropertyName("nine_nine")]
    public double? nineNine { get; set; }
}


#endregion


public class AssessmentJobRequestResult
{

    [JsonPropertyName("jobid")]
    public string jobId { get; set; }

    [JsonPropertyName("message")]
    public string message { get; set; }

    [JsonPropertyName("status")]
    public int status { get; set; }
}

public class ValueMonth
{

    [JsonPropertyName("month")]
    public string month { get; set; }

    [JsonPropertyName("value")]
    public double value { get; set; }
}

public class DateValue
{
    [JsonPropertyName("datetime")]
    public DateTime dateTime { get; set; }

    [JsonPropertyName("value")]
    public double value { get; set; }
}

public class XYValues
{

    [JsonPropertyName("xvalue")]
    public double xvalue { get; set; }

    [JsonPropertyName("yvalue")]
    public double yvalue { get; set; }
}



