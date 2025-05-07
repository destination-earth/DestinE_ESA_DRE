using NpgsqlTypes;
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;


namespace DataServices.Models;


public class SolarDustAOT
{
    public DateTime date { get; set; }
    public double withaot { get; set; }
    public double withsmallaot { get; set; }
    public double withmediumaot { get; set; }
    public double withhighaot { get; set; }
}

public class SolarDustPercentage
{
    public DateTime date { get; set; }
    public double withaot { get; set; }
    public double withsmallaot { get; set; }
    public double withmediumaot { get; set; }
    public double withhighaot { get; set; }

}

public class SolarDustTable
{
    public DateTime timestamp { get; set; }
    public double ghi { get; set; }
    public double ghicorrected { get; set; }
    public double aot { get; set; }
    public double production { get; set; }
    public double procuctioncorrected { get; set; }
    public double reduction { get; set; }
}

public class SolarDataResponseDust
{
    [JsonPropertyName("solardustaot")]
    public List<SolarDustAOT> solarDustAOT { get; set; }

    [JsonPropertyName("solardustpercentage")]
    public List<SolarDustPercentage> solarDustPercentage { get; set; }

    [JsonPropertyName("solardusttable")]
    public List<SolarDustTable> solarDustTable { get; set; }


    [JsonPropertyName("solardusttablesmall")]
    public List<SolarDustTable> solarDustTableSmall { get; set; }


    [JsonPropertyName("solardusttablemedium")]
    public List<SolarDustTable> solarDustTableMedium { get; set; }


    [JsonPropertyName("solardusttablehigh")]
    public List<SolarDustTable> solarDustTableHigh { get; set; }
}

public class SolarDataResponse
{
    [JsonPropertyName("productionRecords")]
    public List<SolarDataResponseRecords> ProductionRecords { get; set; }

    [JsonPropertyName("predictionRecords")]
    public List<SolarDataResponseRecords> PredictionRecords { get; set; }

    [JsonPropertyName("meterologicalData")]
    public List<MeterologicalData> MeterologicalData { get; set; }

    [JsonPropertyName("kpis")]
    public List<LabelValueDetails> KpisData { get; set; }

}

public class LabelValueDetails
{
    [JsonPropertyName("label")]
    public string Label { get; set; }

    [JsonPropertyName("value")]
    public string Value { get; set; }

    [JsonPropertyName("details")]
    public string Details { get; set; }


    [JsonPropertyName("id")]
    public int Id { get; set; }
}

public class MeterologicalData
{
    [JsonPropertyName("datetime")]
    public DateTime Datetime { get; set; }

    [JsonPropertyName("ambientTemperature")]
    public double AmbientTemperature { get; set; }

    [JsonPropertyName("solarIrradiationDust")]
    public double SolarIrradiationDust { get; set; }
}

public class SolarDataResponseRecords
{
    [JsonPropertyName("datetime")]
    public DateTime Datetime { get; set; }

    [JsonPropertyName("powerKw")]
    public double PowerKw { get; set; }

    [JsonPropertyName("solarIrradiation")]
    public double SolarIrradiation { get; set; }

    [JsonPropertyName("ambientTemperature")]
    public double AmbientTemperature { get; set; }

    [JsonPropertyName("powerKwDust")]
    public double PowerKwDust { get; set; }

    [JsonPropertyName("solarIrradiationDust")]
    public double SolarIrradiationDust { get; set; }

}

public class WindDataResponse
{
    [JsonPropertyName("outputData")]
    public List<WindDataOutput> OutputData { get; set; }

    [JsonPropertyName("forecastData")]
    public List<WindDataOutput> ForecastData { get; set; }

    [JsonPropertyName("windComparison")]
    public List<OutputComparison> WindComparison { get; set; }

    [JsonPropertyName("kpis")]
    public List<LabelValueDetails> KpisData { get; set; }
}

public class WindDataOutput
{
    [JsonPropertyName("datetime")]
    public DateTime Datetime { get; set; }

    [JsonPropertyName("powerKw")]
    public double PowerKw { get; set; }

    [JsonPropertyName("airSpeed")]
    public double AirSpeed { get; set; }

    [JsonPropertyName("direction")]
    public double Direction { get; set; }
}

public class OutputComparison
{
    [JsonPropertyName("datetime")]
    public DateTime Datetime { get; set; }

    [JsonPropertyName("forecastpower")]
    public double ForecastPower { get; set; }

    [JsonPropertyName("outputpower")]
    public double OutputPower { get; set; }
}

public class HybridDataResponse
{
    [JsonPropertyName("outputData")]
    public List<HybridDataOuput> OutputData { get; set; }

    [JsonPropertyName("forecastData")]
    public List<HybridDataOuput> ForecastData { get; set; }

    [JsonPropertyName("hybridComparison")]
    public List<OutputComparison>HybridComparison { get; set; }
}



    public class HybridDataOuput
{
    [JsonPropertyName("datetime")]
    public DateTime Datetime { get; set; }

    [JsonPropertyName("powerkWSolar")]
    public double PowerKwSolar { get; set; }

    [JsonPropertyName("solarIrradiance")]
    public double SolarIrradiance { get; set; }

    [JsonPropertyName("ambientTemperature")]
    public double AmbientTemperature { get; set; }

    [JsonPropertyName("powerkWWind")]
    public double PowerKwWind { get; set; }

    [JsonPropertyName("airSpeedWind")]
    public double AirSpeedWind { get; set; }

    [JsonPropertyName("directionWind")]
    public double DirectionWind { get; set; }

    [JsonPropertyName("powerkWTotal")]
    public double PowerKwTotal { get; set; }
}







#region Solar With Dust


//Solar Response from NOA:
public class SolarSiteResponseDetails
{
    [JsonProperty("site")]
    public string Site { get; set; }

    [JsonProperty("latitude")]
    public double Latitude { get; set; }

    [JsonProperty("longitude")]
    public double Longitude { get; set; }

    [JsonProperty("altitude")]
    public double Altitude { get; set; }

    [JsonProperty("generation_date")]
    public string GenerationDate { get; set; }

    [JsonProperty("request_id")]
    public string RequestId { get; set; }

    [JsonProperty("reduction_class")]
    public string ReductionClass { get; set; }

    [JsonProperty("solar_variables")]
    public List<SolarVariable> SolarVariables { get; set; }
}

public class DustDatum
{
    [JsonProperty("order")]
    public int Order { get; set; }

    [JsonProperty("timestamp")]
    public string Timestamp { get; set; }

    [JsonProperty("ghi")]
    public double Ghi { get; set; }

    [JsonProperty("ghi_corrected")]
    public double GhiCorrected { get; set; }

    [JsonProperty("aot")]
    public double Aot { get; set; }

    [JsonProperty("production")]
    public double Production { get; set; }

    [JsonProperty("production_corrected")]
    public double ProductionCorrected { get; set; }

    [JsonProperty("reduction_percent")]
    public double ReductionPercent { get; set; }
}

public class SolarKpis
{
    [JsonProperty("availability")]
    public double Availability { get; set; }

    [JsonProperty("performace_ratio")]
    public double PerformaceRatio { get; set; }

    [JsonProperty("efficiency")]
    public double Efficiency { get; set; }
}

public class SolarDustResponse
{
    [JsonProperty("details")]
    public SolarSiteResponseDetails Details { get; set; }

    [JsonProperty("kpis")]
    public SolarKpis Kpis { get; set; }

    [JsonProperty("dust_data")]
    public List<DustDatum> DustData { get; set; }
}

public class SolarVariable
{
    [JsonProperty("order")]
    public int Order { get; set; }

    [JsonProperty("timestamp")]
    public string Timestamp { get; set; }

    [JsonProperty("sza_mid1h")]
    public double SzaMid1h { get; set; }

    [JsonProperty("RH_MS_1h")]
    public double RHMS1h { get; set; }

    [JsonProperty("WindSpe_ms_MS_1h")]
    public double WindSpeMsMS1h { get; set; }

    [JsonProperty("cams_ghi1h_Jm2")]
    public double CamsGhi1hJm2 { get; set; }
}




//Solar Request to NOA:

public class SolarDustRequest
{
    [JsonProperty("site")]
    public string Site { get; set; }

    [JsonProperty("latitude")]
    public double Latitude { get; set; }

    [JsonProperty("longitude")]
    public double Longitude { get; set; }

    [JsonProperty("altitude")]
    public int Altitude { get; set; }

    [JsonProperty("from_date")]
    public string FromDate { get; set; }

    [JsonProperty("to_date")]
    public string ToDate { get; set; }

    [JsonProperty("request_id")]
    public string RequestId { get; set; }

    [JsonProperty("class_")]
    public List<string> Class { get; set; }
}

#endregion