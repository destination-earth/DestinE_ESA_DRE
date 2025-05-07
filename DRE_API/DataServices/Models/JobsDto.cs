using System.Collections.Generic;
using System.Text.Json.Serialization;
using System;
using WebApiData.Entities;


namespace DataServices.Models;

public class Jobs
{
    [JsonPropertyName("jobs")]
    public List<JobsRecord> JobList { get; set; }

    [JsonPropertyName("helper")]
    public string Helper { get; set; }
}

public class FullJobs
{
    [JsonPropertyName("job")]
    public JobsRecord Job { get; set; }

    [JsonPropertyName("jobsresponses")]
    public List<JobsResponses> JobsResponses { get; set; }
    [JsonPropertyName("jobfiles")]
    public List<JobFiles> JobResponseFiles { get; set; }


}

public class JobsFilters
{

    [JsonPropertyName("key")]
    public string Key { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; } //Forecast //assessment

    [JsonPropertyName("source")]
    public string Source { get; set; } //Solar, Wind

    [JsonPropertyName("plan")]
    public string Plan { get; set; } //Premium,basic

    [JsonPropertyName("aux")]
    public string Aux { get; set; } //Auxiliary data
}

public class JobsRecord
{

    [JsonPropertyName("jobKey")]
    public string JobKey { get; set; }

    [JsonPropertyName("datetime")]
    public DateTime Datetime { get; set; }

    [JsonPropertyName("datetimeStr")]
    public string DatetimeStr { get; set; }
    [JsonPropertyName("energySource")]
    public string EnergySource { get; set; }


    [JsonPropertyName("fortype")]
    public string ForType { get; set; }

    [JsonPropertyName("plan")]
    public string Plan { get; set; }

    [JsonPropertyName("progress")]
    public string Progress { get; set; }

    [JsonPropertyName("parameters")]
    public string Parameters { get; set; }

    [JsonPropertyName("downloadVisualizedUrls")]
    public string[] DownloadVisualizedUrls { get; set; }

    [JsonPropertyName("downloadUrls")]
    public string[] DownloadUrls { get; set; }

    [JsonPropertyName("comments")]
    public string Comments { get; set; }

    [JsonPropertyName("uploadedfiles")]
    public string[] UploadedFiles { get; set; }



    [JsonPropertyName("use_train_data")]
    public bool UseTrainData { get; set; } = false;

    [JsonPropertyName("use_curve_data")]
    public bool UseCurveData { get; set; } = false;

}



public class JobUpdateProgress
{
    [JsonPropertyName("jobKey")]
    public string JobKey { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; }
}


public class JobFinished
{
    [JsonPropertyName("jobKey")]
    public string JobKey { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; }

    [JsonPropertyName("error")]
    public string Error { get; set; }

    [JsonPropertyName("datetime")]
    public DateTime Datetime { get; set; }

    [JsonPropertyName("payload")]
    public object Payload { get; set; }

    [JsonPropertyName("files")]
    public List<JobResponseFiles> Files { get; set; }
}

public class JobResponseFiles
{
    [JsonPropertyName("path")]
    public string Path { get; set; }

    [JsonPropertyName("friendlyname")]
    public string FriendlyName { get; set; }

    [JsonPropertyName("size")]
    public int Size { get; set; }

}


 public class JobResponse
{

    [JsonPropertyName("jobKey")]
    public string JobKey { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; } //forecast/assessment

    [JsonPropertyName("source")]
    public string Source { get; set; } //solar/wind

    [JsonPropertyName("error")]
    public string Error { get; set; }

    [JsonPropertyName("datetime")]
    public DateTime Datetime { get; set; }

}



public class JobResponseUI
{

    [JsonPropertyName("jobkey")]
    public string JobKey { get; set; }

    [JsonPropertyName("responseid")]
    public string RessponseId { get; set; }


    [JsonPropertyName("type")]
    public string Type { get; set; } //forecast/assessment

    [JsonPropertyName("plan")]
    public string Plan { get; set; } //basic/premium

    [JsonPropertyName("source")]
    public string Source { get; set; } //solar/wind

 
    [JsonPropertyName("displaydates")]
    public string Dates { get; set; }

}