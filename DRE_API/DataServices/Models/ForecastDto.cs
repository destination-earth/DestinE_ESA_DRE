using System.Collections.Generic;
using System.Text.Json.Serialization;
using System;


namespace DataServices.Models;
 
public class ForecastJobRequestResult
{

    [JsonPropertyName("jobid")]
    public string jobId { get; set; }

    [JsonPropertyName("message")]
    public string message { get; set; }

    [JsonPropertyName("status")]
    public int status { get; set; }
}


public class SolarForecastLocationRequest
{
    [JsonPropertyName("latitude")]
    public double latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double longitude { get; set; }

    [JsonPropertyName("elevation")]
    public double elevation { get; set; }


    [JsonPropertyName("filename")]
    public string FileName { get; set; }


    [JsonPropertyName("file_path")]
    public string file_path { get; set; }

    [JsonPropertyName("guid")]
    public string guid { get; set; }

    [JsonPropertyName("aux")]
    public string aux { get; set; }

    [JsonPropertyName("use_file")]
    public bool use_file { get; set; }

}

public class SolarForecastFullRequest : SolarForecastLocationRequest
{

    [JsonPropertyName("tilt")]
    public double tilt { get; set; }

    [JsonPropertyName("azimuth")]
    public double azimuth { get; set; }

    [JsonPropertyName("tracking")]
    public double tracking { get; set; }

    [JsonPropertyName("capacity")]
    public double capacity { get; set; }
}

public class ForecastSolarBasicResponse
{
    [JsonPropertyName("forecastvstime")]
    public List<PowerWithIrradiation> forecastVSTime { get; set; }

    [JsonPropertyName("realvsforecast")]
    public List<OutputVSForecast> realvsforecast { get; set; }

    [JsonPropertyName("csv_link")]
    public string[] csvLink { get; set; }

    [JsonPropertyName("job_type")]
    public string jobtype { get; set; }
}


public class PowerWithIrradiation
{
    [JsonPropertyName("power")]
    public double power { get; set; }

    [JsonPropertyName("irradiation")]
    public double irradiation { get; set; }

    [JsonPropertyName("datetime")]
    public DateTime dateTime { get; set; }
}

public class OutputVSForecast
{
    [JsonPropertyName("poweroutput")]
    public double powerOutput{ get; set; }

    [JsonPropertyName("powerforecast")]
    public double powerForecast { get; set; }

    [JsonPropertyName("step")]
    public int step { get; set; }

    [JsonPropertyName("datetime")]
    public DateTime dateTime { get; set; }
}


public class WindForecastLocationRequest
{
    [JsonPropertyName("latitude")]
    public double latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double longitude { get; set; }

    [JsonPropertyName("hubheight")]
    public int hubHeight { get; set; }

    [JsonPropertyName("filename")]
    public string FileName { get; set; }

    [JsonPropertyName("train_data")]
    public string trainData { get; set; }

    [JsonPropertyName("guid")]
    public string guid { get; set; }

    [JsonPropertyName("aux")]
    public string aux { get; set; }

}

public class WindForecastFullRequest: WindForecastLocationRequest
{
 
    [JsonPropertyName("powerCurveModel")]
    public string powerCurveModel { get; set; }

    [JsonPropertyName("capacity")]
    public double capacity { get; set; }



}





public class WindPowerSpeed
{
    [JsonPropertyName("poweroutput")]
    public double powerOutput { get; set; }

    [JsonPropertyName("windspeed")]
    public double windspeed { get; set; }

    [JsonPropertyName("step")]
    public int step { get; set; }

    [JsonPropertyName("datetime")]
    public DateTime dateTime { get; set; }
}







public class ForecastWindBasicResponse
{
    [JsonPropertyName("forecastvstime")]
    public List<WindPowerSpeed> forecastVSTime { get; set; }

    [JsonPropertyName("realvsforecast")]
    public List<OutputVSForecast> realvsforecast { get; set; }

    [JsonPropertyName("csv_link")]
    public string[] csvLink { get; set; }


    [JsonPropertyName("job_type")]
    public string jobtype { get; set; }
}




public class FileValidationResult
{
    [JsonPropertyName("valid")]
    public bool valid { get; set; }

    [JsonPropertyName("message")]
    public string message { get; set; }

    [JsonPropertyName("file_path")]
    public string file_path { get; set; }

    [JsonPropertyName("guid")]
    public string guid { get; set; }

    [JsonPropertyName("aux")]
    public string aux { get; set; }
}




public class ErrorResult
{
    [JsonPropertyName("errorcode")]
    public int ErrorCode { get; set; }

    [JsonPropertyName("errormessage")]
    public string ErrorMessage { get; set; }

    [JsonPropertyName("errordetails")]
    public string ErrorDetails { get; set; }

    [JsonPropertyName("filepath")]
    public string FilePath { get; set; }
}
