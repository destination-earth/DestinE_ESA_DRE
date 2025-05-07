using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Interfaces;
using System.Net.Http.Headers;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Net.Http;
using System.Collections.Generic;
using DataServices.Models;
using DataServices.Interfaces;
using WebApiData.Helpers;
using System.Text;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using serial = System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WebApiData.Helpers;

namespace WebApiData.Services;

public class ExternalHttpService : IExternalHttpService
{
    private readonly DataContext _context;
    protected readonly ILogger _logger;
    private IConfiguration _configuration;

    public ExternalHttpService(DataContext context, ILogger<ExternalHttpService> logger, IConfiguration configuration)
    {
        _context = context;
        _logger = logger;
        _configuration = configuration;
    }

    //toDo: move to config


    #region Solar APIs

    public async Task<ExtSolarValidateResponse> ValidateSolarCsvAsync(string fullPath)
    {
        var url = $"{GetBaseUrl("NoaBaseUrl")}validate-csv";
        var filePayload = new ExtSolarValidateRequest { file_path = fullPath };
        var fileResult = await PostAsync<ExtSolarValidateRequest, ExtSolarValidateResponse>(url, filePayload);
        return fileResult;
    }

    public async Task<ExtSolarProcessResponse> ProcessTrainSolarAsync(ExtSolarProcessRequest dataPayload)
    {
        var url = $"{GetBaseUrl("NoaBaseUrl")}process";
        var fileResult = await PostAsync<ExtSolarProcessRequest, ExtSolarProcessResponse>(url, dataPayload);   
        return fileResult;
    }

    public async Task<string> ProcessInferenceSolarAsync(ExtSolarInferenceRequest dataPayload)
    {
        var url = $"{GetBaseUrl("NoaInferenceUrl")}solar-forecast";
        var fileResult = await PostAsync<ExtSolarInferenceRequest, string>(url, dataPayload);
        return fileResult;
    }

    public async Task<ExtSolarAssessmentGenericResponse> ProcessSolarAssessmentBasicAsync(ExtSolarBasicAssessmentRequest dataPayload)
    {

        try
        { 
            var json = serial.JsonSerializer.Serialize(dataPayload);
            var url = $"{GetBaseUrl("NoaSolarAssessmentBasicUrl")}";
            var fileResult = await PostAsync<ExtSolarBasicAssessmentRequest, ExtSolarProcessResponse>(url, dataPayload);

            ExtSolarAssessmentGenericResponse extWindAssessmentGenericResponse = new ExtSolarAssessmentGenericResponse()
            {
                response = serial.JsonSerializer.Serialize(fileResult),
                error = "success",
                hasError = false,
                jobKey = dataPayload.jobKey
            };

            return extWindAssessmentGenericResponse;
        }
        catch (Exception ex)
        {

            ExtSolarAssessmentGenericResponse extWindAssessmentGenericResponse = new ExtSolarAssessmentGenericResponse()
            {
                response = "",
                error = ex.Message,
                hasError = true,
                jobKey = dataPayload.jobKey
            };
            return extWindAssessmentGenericResponse;
        }










        
    }

    public async Task<ExtSolarAssessmentGenericResponse> ProcessSolarAssessmentPremiumAsync(ExtSolarPremiumAssessmentRequest dataPayload)
    {

        try
        {
            var json = serial.JsonSerializer.Serialize(dataPayload);
            var url = $"{GetBaseUrl("NoaSolarAssessmentPremiumUrl")}";
            var fileResult = await PostAsync<ExtSolarPremiumAssessmentRequest, ExtSolarProcessResponse>(url, dataPayload);

            ExtSolarAssessmentGenericResponse extWindAssessmentGenericResponse = new ExtSolarAssessmentGenericResponse()
            {
                response = serial.JsonSerializer.Serialize(fileResult),
                error = "success",
                hasError = false,
                jobKey = dataPayload.jobKey
            };

            return extWindAssessmentGenericResponse;
        }
        catch (Exception ex)
        {

            ExtSolarAssessmentGenericResponse extWindAssessmentGenericResponse = new ExtSolarAssessmentGenericResponse()
            {
                response = "",
                error = ex.Message,
                hasError = true,
                jobKey = dataPayload.jobKey
            };
            return extWindAssessmentGenericResponse;
        }


    }




    public async Task<ExtSolarAssessmentGenericResponse> SolarForecastParkSpecificationsAsync(ExtSolarForecastParkSpecificationsRequest dataPayload)
    {

        try
        {
            var json = serial.JsonSerializer.Serialize(dataPayload);
            var url = $"{GetBaseUrl("NoaSolarForecastOnlyParkSpecs")}";
            var fileResult = await PostAsync<ExtSolarForecastParkSpecificationsRequest, ExtSolarProcessResponse>(url, dataPayload);

            ExtSolarAssessmentGenericResponse extWindAssessmentGenericResponse = new ExtSolarAssessmentGenericResponse()
            {
                response = serial.JsonSerializer.Serialize(fileResult),
                error = "success",
                hasError = false,
                jobKey = dataPayload.jobKey
            };

            return extWindAssessmentGenericResponse;
        }
        catch (Exception ex)
        {

            ExtSolarAssessmentGenericResponse extWindAssessmentGenericResponse = new ExtSolarAssessmentGenericResponse()
            {
                response = "",
                error = ex.Message,
                hasError = true,
                jobKey = dataPayload.jobKey
            };
            return extWindAssessmentGenericResponse;
        }


    }

 




    #endregion

    #region Wind APIs
    public async Task<ExtWindAssessmentGenericResponse> WindAssessmentBasicAsync(ExtWindAssessmentBasicRequest dataPayload)
    {
        try
        {
            var url = $"{GetBaseUrl("WeMetBasicAssessementUrl")}";
            var fileResult = await PostAsync<ExtWindAssessmentBasicRequest, ExtWindFullResponse>(url, dataPayload);

            ExtWindAssessmentGenericResponse extWindAssessmentGenericResponse = new ExtWindAssessmentGenericResponse()
            {
                error ="success",
                hasError = false,
                jobKey = dataPayload.jobKey
            };

            return extWindAssessmentGenericResponse;
        }
        catch (Exception ex)
        {
            ExtWindAssessmentGenericResponse extWindAssessmentGenericResponse = new ExtWindAssessmentGenericResponse()
            {
                error = ex.Message,
                hasError = true,
                jobKey = dataPayload.jobKey
            };
            return extWindAssessmentGenericResponse;
        }
    }

    public async Task<ExtWindAssessmentGenericResponse> WindAssessmentPremiumAsync(ExtWindAssessmentPremiumRequest dataPayload)
    {
        try
        {
            var url = $"{GetBaseUrl("WeMetPremiumAssessementUrl")}";

            var json = serial.JsonSerializer.Serialize(dataPayload);

            var fileResult = await PostAsync<ExtWindAssessmentPremiumRequest, ExtWindAssessmentSuccessResponse>(url, dataPayload);



            ExtWindAssessmentGenericResponse extWindAssessmentGenericResponse = new ExtWindAssessmentGenericResponse()
            {
                response = serial.JsonSerializer.Serialize(fileResult),
                error = "success",
                hasError = false,
                jobKey = dataPayload.jobKey
            };

            return extWindAssessmentGenericResponse;
        }
        catch (Exception ex)
        {

            ExtWindAssessmentGenericResponse extWindAssessmentGenericResponse = new ExtWindAssessmentGenericResponse()
            {
                response="",
                error = ex.Message,
                hasError = true,
                jobKey = dataPayload.jobKey
            };
            return extWindAssessmentGenericResponse;
        }
    }

    public async Task<ExtWindForecastGenericResponse> WindForecastPremiumAsync(ExtWindForecastPremiumRequest dataPayload)
    {
        try
        {
            var url = $"{GetBaseUrl("WeMetPremiumForecastUrl")}";

            //var json = serial.JsonSerializer.Serialize(dataPayload);

            var fileResult = await PostAsync<ExtWindForecastPremiumRequest, ExtWindForecastFulResponse>(url, dataPayload);



            ExtWindForecastGenericResponse extWindAssessmentGenericResponse = new ExtWindForecastGenericResponse()
            {
                response = serial.JsonSerializer.Serialize(fileResult),
                error = "success",
                hasError = false,
                jobKey = dataPayload.jobKey
            };

            return extWindAssessmentGenericResponse;
        }
        catch (Exception ex)
        {

            ExtWindForecastGenericResponse extWindAssessmentGenericResponse = new ExtWindForecastGenericResponse()
            {
                error = ex.Message,
                hasError = true,
                jobKey = dataPayload.jobKey
            };
            return extWindAssessmentGenericResponse;
        }
    }



    public async Task<ExtWindForecastGenericResponse> WindForecastBasicAsync(ExtWindForecastBasicRequest dataPayload)
    {
        try
        {
            var url = $"{GetBaseUrl("WeMetBasicForecastUrl")}";

            //var json = serial.JsonSerializer.Serialize(dataPayload);

            var fileResult = await PostAsync<ExtWindForecastBasicRequest, ExtWindForecastFulResponse>(url, dataPayload);



            ExtWindForecastGenericResponse extWindAssessmentGenericResponse = new ExtWindForecastGenericResponse()
            {
                response = serial.JsonSerializer.Serialize(fileResult),
                error = "success",
                hasError = false,
                jobKey = dataPayload.jobKey
            };

            return extWindAssessmentGenericResponse;
        }
        catch (Exception ex)
        {

            ExtWindForecastGenericResponse extWindAssessmentGenericResponse = new ExtWindForecastGenericResponse()
            {
                error = ex.Message,
                hasError = true,
                jobKey = dataPayload.jobKey
            };
            return extWindAssessmentGenericResponse;
        }
    }




    #endregion

    private async Task<TResponse> PostAsync<TPayload, TResponse>(string url, TPayload payload)
    {
        using var httpClient = new HttpClient();
        var json = serial.JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await httpClient.PostAsync(url, content);
            //response.EnsureSuccessStatusCode();
            var responseBody = await response.Content.ReadAsStringAsync();
            if (response.IsSuccessStatusCode)
            {
                return serial.JsonSerializer.Deserialize<TResponse>(responseBody);
            }
            else
            {
                Exception ex = new Exception(responseBody);
                throw new ApplicationException($"POST request to {url} failed: {responseBody}",ex);
            }
        }
        catch (Exception ex)
        {
            throw new ApplicationException($"POST request to {url} failed: {ex.Message}", ex);
        }
    }

    private string GetBaseUrl(string serviceName)
    {
        return DataStaticHelpers.GetSetting(_configuration, serviceName);
    }

}