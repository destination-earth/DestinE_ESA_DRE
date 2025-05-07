using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace DataServices.Models;

// Solar

public class ExtSolarProcessRequest
{
    [JsonPropertyName("longitude")]
    public double longitude { get; set; }

    [JsonPropertyName("latitude")]
    public double latitude { get; set; }

    [JsonPropertyName("altitude")]
    public double altitude { get; set; }

    [JsonPropertyName("user_template_path")]
    public string user_template_path { get; set; }

    [JsonPropertyName("model_output_path")]
    public string model_output_path { get; set; }

    [JsonPropertyName("jobKey")]
    public string jobKey { get; set; }
}
public class ExtSolarProcessResponse
{
    [JsonPropertyName("jobKey")]
    public string jobKey { get; set; }

    [JsonPropertyName("status")]
    public string status { get; set; }

    [JsonPropertyName("type")]
    public string type { get; set; }

    [JsonPropertyName("source")]
    public string source { get; set; }

    [JsonPropertyName("error")]
    public object error { get; set; }

    [JsonPropertyName("datetime")]
    public DateTime datetime { get; set; }

    [JsonPropertyName("address")]
    public string address { get; set; }
}
public class ExtSolarValidateRequest
    {
        [JsonPropertyName("file_path")]
        public string file_path { get; set; }
    }
public class ExtSolarValidateResponse
{
    [JsonPropertyName("valid")]
    public bool valid { get; set; }

    [JsonPropertyName("message")]
    public string message { get; set; }

    [JsonPropertyName("file_path")]
    public string file_path { get; set; }
}
public class ExtSolarInferenceRequest
{
    [JsonPropertyName("longitude")]
    public double longitude { get; set; }

    [JsonPropertyName("latitude")]
    public double latitude { get; set; }

    [JsonPropertyName("altitude")]
    public int altitude { get; set; }

    [JsonPropertyName("grib_file_path")]
    public string grib_file_path { get; set; }

    [JsonPropertyName("trained_model_path")]
    public string trained_model_path { get; set; }

    [JsonPropertyName("jobKey")]
    public string jobKey { get; set; }
}
public class SolarForecastRecords
{
    [JsonPropertyName("timestamp")]
    public DateTime timestamp { get; set; }

    [JsonPropertyName("predicted_production")]
    public double predicted_production { get; set; }

    [JsonPropertyName("ghi_kWhm2")]
    public double ghi_kWhm2 { get; set; }
}
public class SolarForecastDataFromServiceMetadata
{
    [JsonPropertyName("latitude")]
    public double latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double longitude { get; set; }

    [JsonPropertyName("altitude")]
    public int altitude { get; set; }

    [JsonPropertyName("forecast_date")]
    public string forecast_date { get; set; }

    [JsonPropertyName("total_hours")]
    public int total_hours { get; set; }

    [JsonPropertyName("total_production")]
    public double total_production { get; set; }

    [JsonPropertyName("avg_production")]
    public double avg_production { get; set; }

    [JsonPropertyName("max_production")]
    public double max_production { get; set; }

    [JsonPropertyName("data_source")]
    public string data_source { get; set; }

    [JsonPropertyName("aod_corrected")]
    public bool aod_corrected { get; set; }
}
public class SolarForecastDataFromService
{
    [JsonPropertyName("forecasts")]
    public List<SolarForecastRecords> forecasts { get; set; }

    [JsonPropertyName("metadata")]
    public SolarForecastDataFromService metadata { get; set; }
}
public class ExtSolarBasicAssessmentRequest
{
    [JsonPropertyName("jobKey")]
    public string jobKey { get; set; }

    [JsonPropertyName("latitude")]
    public double latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double longitude { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime startDate { get; set; }

    [JsonPropertyName("endDate")]
    public DateTime endDate { get; set; }
}



public class ExtSolarForecastParkSpecificationsRequest
{
    [JsonPropertyName("jobKey")]
    public string jobKey { get; set; }

    [JsonPropertyName("latitude")]
    public double latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double longitude { get; set; }

    [JsonPropertyName("tilt")]
    public double tilt { get; set; }

    [JsonPropertyName("azimuth")]
    public double azimuth { get; set; }

    [JsonPropertyName("tracking")]
    public double tracking { get; set; }

    [JsonPropertyName("capacity")]
    public double capacity { get; set; }
}



public class ExtSolarPremiumAssessmentRequest
{
    [JsonPropertyName("jobKey")]
    public string jobKey { get; set; }

    [JsonPropertyName("latitude")]
    public double latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double longitude { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime startDate { get; set; }

    [JsonPropertyName("endDate")]
    public DateTime endDate { get; set; }

    [JsonPropertyName("tilt")]
    public double tilt { get; set; }

    [JsonPropertyName("azimuth")]
    public double azimuth { get; set; }

    [JsonPropertyName("tracking")]
    public int tracking { get; set; }

    [JsonPropertyName("capacity")]
    public double capacity { get; set; }
}


public class ExtSolarAssessmentGenericResponse
{
    [JsonPropertyName("jobKey")]
    public string jobKey { get; set; }

    [JsonPropertyName("error")]
    public string error { get; set; }

    [JsonPropertyName("haserror")]
    public bool hasError { get; set; }

    [JsonPropertyName("response")]
    public string response { get; set; }
}

public class ErrorSolarDetails
{
    [JsonPropertyName("row_number")]
    public int row_number { get; set; }

    [JsonPropertyName("column")]
    public string column { get; set; }

    [JsonPropertyName("error_type")]
    public string error_type { get; set; }

    [JsonPropertyName("message")]
    public string message { get; set; }
}
public class ExtSolarValidationFileError
{
    [JsonPropertyName("valid")]
    public bool valid { get; set; }

    [JsonPropertyName("errors")]
    public List<ErrorSolarDetails> errors { get; set; }

    [JsonPropertyName("message")]
    public string message { get; set; }
}










// Wind

public class ExtWindAssessmentBasicRequest
{
    [JsonPropertyName("startDate")]
    public DateTime startDate { get; set; }

    [JsonPropertyName("endDate")]
    public DateTime endDate { get; set; }

    [JsonPropertyName("jobKey")]
    public string jobKey { get; set; }

    [JsonPropertyName("latitude")]
    public string latitude { get; set; }

    [JsonPropertyName("longitude")]
    public string longitude { get; set; }

    [JsonPropertyName("height")]
    public string height { get; set; }


    [JsonPropertyName("power_curve")]
    public string power_curve { get; set; }

    [JsonPropertyName("use_train_data")]
    public bool use_train_data { get; set; }
}
public class ExtWindAssessmentPremiumRequest
{
    [JsonPropertyName("startDate")]
    public DateTime startDate { get; set; }

    [JsonPropertyName("endDate")]
    public DateTime endDate { get; set; }

    [JsonPropertyName("jobKey")]
    public string jobKey { get; set; }

    [JsonPropertyName("latitude")]
    public string latitude { get; set; }

    [JsonPropertyName("longitude")]
    public string longitude { get; set; }

    [JsonPropertyName("height")]
    public string height { get; set; }

    [JsonPropertyName("power_curve")]
    public string power_curve { get; set; }

    [JsonPropertyName("use_train_data")]
    public bool use_train_data { get; set; }
}
public class ExtWindAssessmentGenericResponse
{
    [JsonPropertyName("jobKey")]
    public string jobKey { get; set; }

    [JsonPropertyName("error")]
    public string error { get; set; }

    [JsonPropertyName("haserror")]
    public bool hasError { get; set; }

    [JsonPropertyName("response")]
    public string response { get; set; }
}
public class ExtWindAssessmentSuccessResponse
{
    [JsonPropertyName("jobKey")]
    public string jobKey { get; set; }

    [JsonPropertyName("status")]
    public string status { get; set; }

    [JsonPropertyName("type")]
    public string type { get; set; }

    [JsonPropertyName("source")]
    public string source { get; set; }

    [JsonPropertyName("error")]
    public object error { get; set; }

    [JsonPropertyName("datetime")]
    public DateTime datetime { get; set; }
}
public class Ctx
{
    [JsonPropertyName("expected")]
    public string expected { get; set; }
}
public class DetailWindAssessmentErrorResponse
{
    [JsonPropertyName("type")]
    public string type { get; set; }

    [JsonPropertyName("loc")]
    public List<string> loc { get; set; }

    [JsonPropertyName("msg")]
    public string msg { get; set; }

    [JsonPropertyName("input")]
    public string input { get; set; }

    [JsonPropertyName("ctx")]
    public Ctx ctx { get; set; }
}
public class ExtWindAssessmentErrorResponse
{
    [JsonPropertyName("detail")]
    public List<DetailWindAssessmentErrorResponse> detail { get; set; }
}

public class ExtWindForecastPremiumRequest
{
    [JsonPropertyName("jobKey")]
    public string jobKey { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime startDate { get; set; }

    [JsonPropertyName("lat")]
    public double lat { get; set; }

    [JsonPropertyName("lon")]
    public double lon { get; set; }

    [JsonPropertyName("height")]
    public int height { get; set; }

    [JsonPropertyName("power_curve")]
    public string power_curve { get; set; }

    [JsonPropertyName("capacity")]
    public double capacity { get; set; }

    [JsonPropertyName("use_train_data")]
    public bool use_train_data { get; set; }

    [JsonPropertyName("use_curve_data")]
    public bool use_curve_data { get; set; }

}

public class ExtWindForecastBasicRequest
{
    [JsonPropertyName("jobKey")]
    public string jobKey { get; set; }

    [JsonPropertyName("startDate")]
    public DateTime startDate { get; set; }

    [JsonPropertyName("lat")]
    public double lat { get; set; }

    [JsonPropertyName("lon")]
    public double lon { get; set; }

    [JsonPropertyName("height")]
    public int height { get; set; }

    [JsonPropertyName("power_curve")]
    public string power_curve { get; set; }

    [JsonPropertyName("capacity")]
    public double capacity { get; set; }

    [JsonPropertyName("use_train_data")]
    public bool use_train_data { get; set; }


    [JsonPropertyName("use_curve_data")]
    public bool use_curve_data { get; set; }



}



public class ExtWindForecastGenericResponse
{
    [JsonPropertyName("jobKey")]
    public string jobKey { get; set; }

    [JsonPropertyName("error")]
    public string error { get; set; }

    [JsonPropertyName("haserror")]
    public bool hasError { get; set; }


    [JsonPropertyName("response")]
    public string response { get; set; }
}


//Normally this is the response when the forecast is over.
public class ExtWindForecastFulResponse
{
    [JsonPropertyName("jobKey")]
    public string jobKey { get; set; }

    [JsonPropertyName("status")]
    public string status { get; set; }

    [JsonPropertyName("type")]
    public string type { get; set; }

    [JsonPropertyName("source")]
    public string source { get; set; }

    [JsonPropertyName("error")]
    public object error { get; set; }

    [JsonPropertyName("datetime")]
    public DateTime datetime { get; set; }

    [JsonPropertyName("files_info")]
    public List<FilesInfo> files_info { get; set; }

    [JsonPropertyName("forecastvstime")]
    public List<Forecastvstime> forecastvstime { get; set; }

    [JsonPropertyName("metadata")]
    public Metadata metadata { get; set; }
}

public class FilesInfo
{
    [JsonPropertyName("path")]
    public string path { get; set; }

    [JsonPropertyName("friendlyname")]
    public string friendlyname { get; set; }

    [JsonPropertyName("size")]
    public int size { get; set; }
}

public class Forecastvstime
{
    [JsonPropertyName("datetime")]
    public DateTime datetime { get; set; }

    [JsonPropertyName("poweroutput")]
    public double poweroutput { get; set; }

    [JsonPropertyName("windspeed")]
    public double windspeed { get; set; }

    [JsonPropertyName("winddirection")]
    public double winddirection { get; set; }

    [JsonPropertyName("step")]
    public int step { get; set; }
}

public class Metadata
{
    [JsonPropertyName("start_date")]
    public DateTime start_date { get; set; }

    [JsonPropertyName("power_curve")]
    public string power_curve { get; set; }

    [JsonPropertyName("forecast_hours")]
    public int forecast_hours { get; set; }

    [JsonPropertyName("generated_at")]
    public DateTime generated_at { get; set; }
}



















//The following classes are used to deserialize the JSON response from the wind assessment API.

// Root myDeserializedClass = JsonSerializer.Deserialize<Root>(myJsonResponse);
public class ExtWindFullResponse
{
    [JsonPropertyName("job_key")]
    public string job_key { get; set; }

    [JsonPropertyName("wind_statistics")]
    public WindStatistics wind_statistics { get; set; }

    [JsonPropertyName("power_statistics")]
    public PowerStatistics power_statistics { get; set; }

    [JsonPropertyName("time_series")]
    public List<TimeSeries> time_series { get; set; }
}

public class AnnualStats
{
    [JsonPropertyName("total_energy_potential_kWh")]
    public double? total_energy_potential_kwh { get; set; }

    [JsonPropertyName("avg_power_output_kWh")]
    public double? avg_power_kwh { get; set; }

    [JsonPropertyName("capacity_factor_percent")]
    public double? capacity_factor_percent { get; set; }

    [JsonPropertyName("avg_wind_speed_m_s")]
    public double? avg_wind_speed_m_s { get; set; }

    [JsonPropertyName("avg_wind_power_density_W_m2")]
    public double? avg_wind_power_density_w_m2 { get; set; }

    [JsonPropertyName("max_power_kW")]
    public double? max_power_kW { get; set; }
}

public class CountWindSpeed
{
    [JsonPropertyName("X")]
    public double? X { get; set; }

    [JsonPropertyName("pdf")]
    public double? pdf { get; set; }
}

public class FreqWindSpeed
{
    [JsonPropertyName("speed")]
    public int? speed { get; set; }

    [JsonPropertyName("frequency")]
    public double? frequency { get; set; }
}

public class HistogramData
{
    [JsonPropertyName("bin_start_m_s")]
    public List<double?> bin_start_m_s { get; set; }

    [JsonPropertyName("bin_end_m_s")]
    public List<double?> bin_end_m_s { get; set; }

    [JsonPropertyName("mean_annual_estimated_energy_kwh")]
    public List<double?> mean_annual_estimated_energy_kwh { get; set; }
}

public class PowerStatistics
{
    [JsonPropertyName("histogram_data")]
    public HistogramData histogram_data { get; set; }

    [JsonPropertyName("annual_stats")]
    public AnnualStats annual_stats { get; set; }
}

public class RoseDiagram
{
    [JsonPropertyName("directions")]
    public List<string> directions { get; set; }

    [JsonPropertyName("windspeedrange")]
    public List<Windspeedrange> windspeedrange { get; set; }
}

public class TimeSeries
{
    [JsonPropertyName("datetime")]
    public DateTime? datetime { get; set; }

    [JsonPropertyName("power_kW")]
    public double? power_kW { get; set; }

    [JsonPropertyName("wind_speed")]
    public double? wind_speed { get; set; }

    [JsonPropertyName("wind_direction")]
    public double? wind_direction { get; set; }
}

public class Windspeedrange
{
    [JsonPropertyName("label")]
    public string label { get; set; }

    [JsonPropertyName("data")]
    public List<double?> data { get; set; }
}

public class WindStatistics
{
    [JsonPropertyName("wind_statistics_record")]
    public List<WindStatisticsRecord> wind_statistics_record { get; set; }

    [JsonPropertyName("count_wind_speed")]
    public List<CountWindSpeed> count_wind_speed { get; set; }

    [JsonPropertyName("freq_wind_speed")]
    public List<FreqWindSpeed> freq_wind_speed { get; set; }

    [JsonPropertyName("rose_diagram")]
    public RoseDiagram rose_diagram { get; set; }
}

public class WindStatisticsRecord
{
    [JsonPropertyName("direction")]
    public string direction { get; set; }

    [JsonPropertyName("frequency")]
    public double? frequency { get; set; }

    [JsonPropertyName("weibull_shape")]
    public double? weibull_shape { get; set; }

    [JsonPropertyName("weibull_scale")]
    public double? weibull_scale { get; set; }

    [JsonPropertyName("mean")]
    public double? mean { get; set; }

    [JsonPropertyName("nine_five")]
    public double? nine_five { get; set; }

    [JsonPropertyName("nine_seven")]
    public double? nine_seven { get; set; }

    [JsonPropertyName("nine_nine")]
    public double? nine_nine { get; set; }
}

