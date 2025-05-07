using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using WebApiData.Entities;
using DataServices.Models;
using Newtonsoft.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using System.Linq;
using System.Globalization;
using static Org.BouncyCastle.Bcpg.Attr.ImageAttrib;
using WebApi.Helpers;
using System.Threading.Tasks;
using System.Runtime.Serialization;
using WebApiData.Services;
using Org.BouncyCastle.Crypto.Agreement;
using System.IO;
using System.Text;
using WebApiData.Helpers;
using static CSharpFunctionalExtensions.Result;
using Microsoft.IdentityModel.Tokens;
using Mapster;
using System.Net.Http;
using serial = System.Text.Json;
using CsvHelper;
using CSharpFunctionalExtensions;
using Microsoft.AspNetCore.Http.HttpResults;
using System.ComponentModel.DataAnnotations;


namespace WebApi.Controllers
{
    [Authorize]
    public class ForecastController(IServiceProvider serviceProvider) : BaseController<AssessmentController>(serviceProvider)
    {
        private readonly IExternalHttpService _externalHttpforecastService = serviceProvider.GetRequiredService<IExternalHttpService>();

        private readonly IJobService _jobService = serviceProvider.GetRequiredService<IJobService>();
        private IConfiguration _configuration = serviceProvider.GetRequiredService<IConfiguration>();

        [HttpGet("initialize")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<string> Initialize([FromQuery] string asset, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            return Ok("Initialize method for Forecast page");
        }


        #region Solar Methods

        [HttpGet("solar/about")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ForecastSolarBasicResponse), StatusCodes.Status200OK)]
        public ActionResult<ForecastSolarBasicResponse> AboutSolar()
        {
            //var u = this.LoggedUser;
            try
            {
                var response = DummyAbout.GenerateDummyDataSolar();
                return Ok(response);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at About Solar",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
        }

        [HttpPost("solar/basic")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ForecastJobRequestResult), StatusCodes.Status200OK)]
        public async Task<ActionResult<ForecastJobRequestResult>> SolarBasic([FromBody] SolarForecastFullRequest request)
        {

            try
            {
                if (request.FileName.IsNullOrEmpty())
                {
                  return await SolarForParkSpecifications(request, JobsTypesFilters.basic);
                }
                else
                {                   
                    return await SolarForecastForUploadedFile(request, JobsTypesFilters.basic);
                }
            }
            catch (Exception ex)
            {

                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at requesting solar forecast",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }

        }
        
        /*
        [HttpPost("solar/basic_file")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ForecastJobRequestResult), StatusCodes.Status200OK)]
        public async Task<ActionResult<ForecastJobRequestResult>> SolarBasicFile([FromForm] IFormFile file, [FromForm] SolarForecastLocationRequest request)
        {

            try
            {
                string storageFilePath = DataStaticHelpers.GetSetting(_configuration, "SolarUpload");

                JobsRecord jobsRecord = new JobsRecord();
                jobsRecord.JobKey =  DataStaticHelpers.GenerateSmallGuid();;

                string uploadedFileName = storageFilePath + DataStaticHelpers.FixEmail(this.LoggedUser.Email) + "_" + jobsRecord.JobKey + ".csv";

                jobsRecord.Datetime = DateTime.Now;
                jobsRecord.DatetimeStr = DateTime.Now.ToShortDateString();
                jobsRecord.EnergySource = JobsTypesFilters.solar;
                jobsRecord.Parameters = JsonConvert.SerializeObject(request);
                jobsRecord.Progress = JobsTypesFilters.pending;
                jobsRecord.Plan = JobsTypesFilters.basic;
                jobsRecord.DownloadUrls = [];
                jobsRecord.Comments = "No comments";
                jobsRecord.UploadedFiles = [uploadedFileName];
                jobsRecord.ForType = JobsTypesFilters.forecast;

                var jobcreated = _jobService.CreateJob(jobsRecord, this.LoggedUser);
                
                var response = new ForecastJobRequestResult { jobId = jobsRecord.JobKey, message = "Success", status = 0 };

                ExtSolarProcessRequest dataPayload = new ExtSolarProcessRequest();
                dataPayload.jobKey = jobsRecord.JobKey;
                dataPayload.latitude = request.latitude;
                dataPayload.longitude = request.longitude;
                //"/app/data/dev_enorainnovation_com_sjk_0000.csv",
                dataPayload.user_template_path = uploadedFileName;
                
                dataPayload.model_output_path = "./models/";
                var result = await _externalHttpforecastService.ProcessTrainSolarAsync(dataPayload);

                return Ok(response);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at Basic Solar with File",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
        }
*/

        [HttpPost("solar/premium")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ForecastJobRequestResult), StatusCodes.Status200OK)]
        public async Task<ActionResult<ForecastJobRequestResult>> SolarPremium([FromBody] SolarForecastFullRequest request)
        {
            try
            {
                if (request.FileName.IsNullOrEmpty())
                {
                    return await SolarForParkSpecifications(request, JobsTypesFilters.premium);
                }
                else
                {
                    return await SolarForecastForUploadedFile(request, JobsTypesFilters.premium);
                }
            }
            catch (Exception ex)
            {

                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at requesting solar forecast",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }

        }

        private async Task<ActionResult<ForecastJobRequestResult>> SolarForecastForUploadedFile([FromBody] SolarForecastFullRequest request,string plan)
        {

            try
            {
                JobsRecord jobsRecord = new JobsRecord();
                jobsRecord.JobKey = request.guid;

                //string uploadedFileName = request.file_path;
                string uploadedFileName = request.FileName;

                jobsRecord.Datetime = DateTime.Now;
                jobsRecord.DatetimeStr = DateTime.Now.ToShortDateString();
                jobsRecord.EnergySource = JobsTypesFilters.solar;
                jobsRecord.Parameters = JsonConvert.SerializeObject(request);
                jobsRecord.Progress = JobsTypesFilters.pending;
                jobsRecord.Plan = plan;
                jobsRecord.DownloadUrls = [];
                jobsRecord.Comments = "No comments";
                jobsRecord.UploadedFiles = [uploadedFileName];
                jobsRecord.ForType = JobsTypesFilters.forecast;


                ExtSolarProcessRequest dataPayload = new ExtSolarProcessRequest();
                dataPayload.jobKey = jobsRecord.JobKey;
                dataPayload.latitude = request.latitude;
                dataPayload.longitude = request.longitude;
                dataPayload.altitude = request.elevation;
                dataPayload.user_template_path = DataStaticHelpers.GetSetting(_configuration, "SolarUploadForecastStored") +  uploadedFileName; 
                dataPayload.model_output_path = DataStaticHelpers.GetSetting(_configuration, "SolarModelOutputPath");

                var result = await _externalHttpforecastService.ProcessTrainSolarAsync(dataPayload);
                if (result.error != null)
                {
                    ErrorResult error = new ErrorResult()
                    {
                        ErrorCode = 500,
                        ErrorMessage = "Error at solar park trained data process",
                        ErrorDetails = result.error.ToString(),
                        FilePath = ""
                    };
                    return StatusCode(StatusCodes.Status500InternalServerError, result.error);
                }

                var jobcreated = _jobService.CreateJob(jobsRecord, this.LoggedUser, result.ToString()); //ToDo, serialize, not correct!

                var response = new ForecastJobRequestResult { jobId = jobsRecord.JobKey, message = "Success", status = 200 };

                return Ok(response);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at Premium Solar with file",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }


        }


        private async Task<ActionResult<ForecastJobRequestResult>> SolarForParkSpecifications([FromBody] SolarForecastFullRequest request,string plan)
        {
            try
            {
                JobsRecord jobsRecord = new JobsRecord();
                jobsRecord.JobKey = DataStaticHelpers.GenerateSmallGuid();

                string uploadedFileName = request.FileName;

                jobsRecord.Datetime = DateTime.Now;
                jobsRecord.DatetimeStr = DateTime.Now.ToShortDateString();
                jobsRecord.EnergySource = JobsTypesFilters.solar;
                jobsRecord.Parameters = JsonConvert.SerializeObject(request);
                jobsRecord.Progress = JobsTypesFilters.pending;
                jobsRecord.Plan = plan;
                jobsRecord.DownloadUrls = [];
                jobsRecord.Comments = "No comments";
                jobsRecord.UploadedFiles = [uploadedFileName];
                jobsRecord.ForType = JobsTypesFilters.forecast;

                ExtSolarForecastParkSpecificationsRequest dataPayload = new ExtSolarForecastParkSpecificationsRequest();
                dataPayload.jobKey = jobsRecord.JobKey;
                dataPayload.latitude = request.latitude;
                dataPayload.longitude = request.longitude;
                dataPayload.azimuth = request.azimuth;
                dataPayload.tilt = request.tilt;
                dataPayload.capacity = request.capacity;
                dataPayload.tracking = request.tracking;

                var result = await _externalHttpforecastService.SolarForecastParkSpecificationsAsync(dataPayload);

                if (result.error != null)
                {
                    ErrorResult error = new ErrorResult()
                    {
                        ErrorCode = 500,
                        ErrorMessage = "Error at Solar park specifications",
                        ErrorDetails = result.error.ToString(),
                        FilePath = ""
                    };
                    return StatusCode(StatusCodes.Status500InternalServerError, result.error);
                }

                var jobcreated = _jobService.CreateJob(jobsRecord, this.LoggedUser, result.ToString()); //ToDo, serialize, not correct!

                var response = new ForecastJobRequestResult { jobId = jobsRecord.JobKey, message = "Success", status = 200 };

                return Ok(response);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at Premium Solar with file",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }

        }

 



        /*
  
        [HttpPost("solar/premium_file")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ForecastJobRequestResult), StatusCodes.Status200OK)]
        public async Task<ActionResult<ForecastJobRequestResult>> SolarPremiumFile([FromForm] IFormFile file, [FromForm] SolarForecastLocationRequest request)
        {

            try
            {
                string storageFilePath = DataStaticHelpers.GetSetting(_configuration, "SolarUpload");

                JobsRecord jobsRecord = new JobsRecord();
                jobsRecord.JobKey = DataStaticHelpers.GenerateSmallGuid(); ;

                string uploadedFileName = storageFilePath + DataStaticHelpers.FixEmail(this.LoggedUser.Email) + "_" + request + ".csv";

                jobsRecord.Datetime = DateTime.Now;
                jobsRecord.DatetimeStr = DateTime.Now.ToShortDateString();
                jobsRecord.EnergySource = JobsTypesFilters.solar;
                jobsRecord.Parameters = JsonConvert.SerializeObject(request);
                jobsRecord.Progress = JobsTypesFilters.pending;
                jobsRecord.Plan = JobsTypesFilters.premium;
                jobsRecord.DownloadUrls = [];
                jobsRecord.Comments = "No comments";
                jobsRecord.UploadedFiles = [uploadedFileName];
                jobsRecord.ForType = JobsTypesFilters.forecast;

                var jobcreated = _jobService.CreateJob(jobsRecord, this.LoggedUser, "pending_answer");

                var response = new ForecastJobRequestResult { jobId = jobsRecord.JobKey, message = "Success", status = 200 };

                ExtSolarProcessRequest dataPayload = new ExtSolarProcessRequest();
                dataPayload.jobKey = jobsRecord.JobKey;
                dataPayload.latitude = request.latitude;
                dataPayload.longitude = request.longitude;
                //"/app/data/dev_enorainnovation_com_sjk_0000.csv",
                dataPayload.user_template_path = uploadedFileName;

                dataPayload.model_output_path = "./models/";
                var result = await _externalHttpforecastService.ProcessTrainSolarAsync(dataPayload);

                return Ok(response);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at Premium Solar with file",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }

        }

 */
        #endregion


        #region Wind Methods


        [HttpGet("wind/about")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        public ActionResult<ForecastWindBasicResponse> WindAbout()
        {
            //var u = this.LoggedUser;
            try
            {
                var response = DummyAbout.GenerateDummyDataWind();
                return Ok(response);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at About Wind",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
        }


        [HttpPost("wind/basic")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ForecastJobRequestResult), StatusCodes.Status200OK)]
        public async Task<ActionResult<ForecastJobRequestResult>> WindBasic([FromBody] WindForecastFullRequest request)
        {

            try
            {
                var curveModel = request.powerCurveModel.IsNullOrEmpty() ? "" : request.powerCurveModel;
                curveModel = curveModel.Contains("custom") ? "custom" : curveModel;

                bool isCurveData = request.powerCurveModel.IsNullOrEmpty() ? false : true;
                bool isTrainData = false;

                string[] uploladedFiles= new string[0];

                if (!request.FileName.IsNullOrEmpty())
                {

                    uploladedFiles = request.FileName.Split(',');
                    var files = request.FileName.Split(',');

                    if (files.Length > 0)
                    {
                        foreach (var file in files)
                        {
                            if (file.Contains("train"))
                            {
                                isTrainData = true;
                                break;
                            }
                        }
                    }
                }
            


                JobsRecord jobsRecord = new JobsRecord();
                jobsRecord.JobKey = request.guid.IsNullOrEmpty()? DataStaticHelpers.GenerateSmallGuid() : request.guid;

                jobsRecord.UploadedFiles = uploladedFiles;

                jobsRecord.Datetime = DateTime.Now;
                jobsRecord.DatetimeStr = DateTime.Now.ToShortDateString();
                jobsRecord.EnergySource = JobsTypesFilters.wind;
                jobsRecord.Parameters = JsonConvert.SerializeObject(request);
                jobsRecord.Progress = JobsTypesFilters.pending;
                jobsRecord.Plan = JobsTypesFilters.premium;
                jobsRecord.DownloadUrls = [];
                jobsRecord.Comments = "No comments";
                jobsRecord.ForType = JobsTypesFilters.forecast;


                ExtWindForecastBasicRequest dataPayload = new ExtWindForecastBasicRequest();
                dataPayload.jobKey = jobsRecord.JobKey;
                dataPayload.lat = request.latitude;
                dataPayload.lon = request.longitude;
                dataPayload.height = request.hubHeight;
                dataPayload.power_curve = curveModel;
                dataPayload.capacity = request.capacity;
                dataPayload.use_curve_data = isCurveData;
                dataPayload.use_train_data = isTrainData;
                dataPayload.startDate = DateTime.Now;


                var result = await _externalHttpforecastService.WindForecastBasicAsync(dataPayload);
                if (result.hasError)
                {
                    ErrorResult error = new ErrorResult()
                    {
                        ErrorCode = 500,
                        ErrorMessage = "Error at Premium Wind",
                        ErrorDetails = result.error,
                        FilePath = ""
                    };
                    return StatusCode(StatusCodes.Status500InternalServerError, error);
                }

                var jobcreated = _jobService.CreateJob(jobsRecord, this.LoggedUser, result.response);

                var response = new ForecastJobRequestResult { jobId = jobsRecord.JobKey, message = "Success", status = 200 };

                return Ok(response);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at Basic Solar",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
        }
        
        
        /*
        [HttpPost("wind/basic_file")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ForecastJobRequestResult), StatusCodes.Status200OK)]
        public ActionResult<ForecastJobRequestResult> WindBasicFile([FromForm] IFormFile file, [FromForm] WindForecastFullRequest request)
        {

            try
            {
                JobsRecord jobsRecord = new JobsRecord();
                jobsRecord.JobKey =  DataStaticHelpers.GenerateSmallGuid();;
                jobsRecord.Datetime = DateTime.Now;
                jobsRecord.DatetimeStr = DateTime.Now.ToShortDateString();
                jobsRecord.EnergySource = JobsTypesFilters.wind;
                jobsRecord.Parameters = JsonConvert.SerializeObject(request);
                jobsRecord.Progress = JobsTypesFilters.pending;
                jobsRecord.Plan = JobsTypesFilters.basic;
                jobsRecord.DownloadUrls = ["https://hyrefapp.dev.desp.space/downloads/wind_speed_timeseries.csv"];
                jobsRecord.Comments = "No comments";
                jobsRecord.UploadedFiles = ["https://hyrefapp.dev.desp.space/downloads/wind_speed_timeseries.csv"]; ;
                jobsRecord.ForType = JobsTypesFilters.forecast;

                var jobcreated = _jobService.CreateJob(jobsRecord, this.LoggedUser);
                var response = new ForecastJobRequestResult { jobId = "myGuid", message = "success", status = 0 };
                return Ok(response);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at Basic Wind File",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error); ;
            }
        }


        */


        [HttpPost("wind/premium")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ForecastJobRequestResult), StatusCodes.Status200OK)]
        public async Task<ActionResult<ForecastJobRequestResult>> WindPremium([FromBody] WindForecastFullRequest request)
        {

            try
            {


                bool isCurveData = request.powerCurveModel.IsNullOrEmpty() ? false : true;
                bool isTrainData = false;

                var curveModel = request.powerCurveModel.IsNullOrEmpty() ? "" : request.powerCurveModel;
                curveModel = curveModel.Contains("custom") ? "custom" : curveModel;

                string[] uploladedFiles = new string[0];

                if (!request.FileName.IsNullOrEmpty())
                {

                    uploladedFiles = request.FileName.Split(',');
                    var files = request.FileName.Split(',');

                    if (files.Length > 0)
                    {
                        foreach (var file in files)
                        {
                            if (file.Contains("train"))
                            {
                                isTrainData = true;
                                break;
                            }
                        }
                    }
                }




                JobsRecord jobsRecord = new JobsRecord();
                jobsRecord.JobKey = request.guid.IsNullOrEmpty() ? DataStaticHelpers.GenerateSmallGuid() : request.guid;

                jobsRecord.UploadedFiles = uploladedFiles;

                jobsRecord.Datetime = DateTime.Now;
                jobsRecord.DatetimeStr = DateTime.Now.ToShortDateString();
                jobsRecord.EnergySource = JobsTypesFilters.wind;
                jobsRecord.Parameters = JsonConvert.SerializeObject(request);
                jobsRecord.Progress = JobsTypesFilters.pending;
                jobsRecord.Plan = JobsTypesFilters.premium;
                jobsRecord.DownloadUrls = [];
                jobsRecord.Comments = "No comments";
                jobsRecord.ForType = JobsTypesFilters.forecast;


                ExtWindForecastPremiumRequest dataPayload = new ExtWindForecastPremiumRequest();
                dataPayload.jobKey = jobsRecord.JobKey;
                dataPayload.lat = request.latitude;
                dataPayload.lon = request.longitude;
                dataPayload.height = request.hubHeight;
                dataPayload.power_curve = curveModel;
                dataPayload.capacity = request.capacity;
                dataPayload.use_curve_data= isCurveData;
                dataPayload.use_train_data = isTrainData;
                dataPayload.startDate = DateTime.Now;

                var result = await _externalHttpforecastService.WindForecastPremiumAsync(dataPayload);
                if (result.hasError)
                {
                    ErrorResult error = new ErrorResult()
                    {
                        ErrorCode = 500,
                        ErrorMessage = "Error at Premium Wind",
                        ErrorDetails = result.error,
                        FilePath = ""
                    };
                    return StatusCode(StatusCodes.Status500InternalServerError, error);
                }

                var jobcreated = _jobService.CreateJob(jobsRecord, this.LoggedUser, result.response);

                var response = new ForecastJobRequestResult { jobId = jobsRecord.JobKey, message = "Success", status = 200 };

                return Ok(response);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at Premium Solar with file",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }

        }
        
        
        /*
 
        [HttpPost("wind/premium_file")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ForecastJobRequestResult), StatusCodes.Status200OK)]
        public ActionResult<ForecastJobRequestResult> WindPremiumFile([FromForm] IFormFile file, [FromForm] WindForecastFullRequest request)
        {

            try
            {
                JobsRecord jobsRecord = new JobsRecord();
                jobsRecord.JobKey =  DataStaticHelpers.GenerateSmallGuid();;
                jobsRecord.Datetime = DateTime.Now;
                jobsRecord.DatetimeStr = DateTime.Now.ToShortDateString();
                jobsRecord.EnergySource = JobsTypesFilters.wind;
                jobsRecord.Parameters = JsonConvert.SerializeObject(request);
                jobsRecord.Progress = JobsTypesFilters.pending;
                jobsRecord.Plan = JobsTypesFilters.premium;
                jobsRecord.DownloadUrls = ["https://hyrefapp.dev.desp.space/downloads/wind_speed_timeseries.csv"];
                jobsRecord.Comments = "No comments";
                jobsRecord.UploadedFiles = ["https://hyrefapp.dev.desp.space/downloads/wind_speed_timeseries.csv"];
                jobsRecord.ForType = JobsTypesFilters.forecast;


                var jobcreated = _jobService.CreateJob(jobsRecord, this.LoggedUser);
                var response = new ForecastJobRequestResult { jobId = "myGuid", message = "success", status = 0 };
                return Ok(response);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at Premium Wind File",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }

        }


  
        [HttpPost("wind/basic_files")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ForecastJobRequestResult), StatusCodes.Status200OK)]
        public ActionResult<ForecastJobRequestResult> WindBasicFiles([FromForm] List<IFormFile> files, [FromForm] WindForecastFullRequest request)
        {

            try
            {
                JobsRecord jobsRecord = new JobsRecord();
                jobsRecord.JobKey =  DataStaticHelpers.GenerateSmallGuid();;
                jobsRecord.Datetime = DateTime.Now;
                jobsRecord.DatetimeStr = DateTime.Now.ToShortDateString();
                jobsRecord.EnergySource = JobsTypesFilters.wind;
                jobsRecord.Parameters = JsonConvert.SerializeObject(request);
                jobsRecord.Progress = JobsTypesFilters.pending;
                jobsRecord.Plan = JobsTypesFilters.basic;
                jobsRecord.DownloadUrls = ["https://hyrefapp.dev.desp.space/downloads/wind_speed_timeseries.csv"];
                jobsRecord.Comments = "No comments";
                jobsRecord.UploadedFiles = ["https://hyrefapp.dev.desp.space/downloads/wind_speed_timeseries.csv"];
                jobsRecord.ForType = JobsTypesFilters.forecast;


                var jobcreated = _jobService.CreateJob(jobsRecord, this.LoggedUser);
                var response = new ForecastJobRequestResult { jobId = "myGuid", message = "success", status = 0 };
                return Ok(response);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at Basic Wind File",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
        }

       



        [HttpPost("wind/premium_files")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ForecastJobRequestResult), StatusCodes.Status200OK)]
        public ActionResult<ForecastJobRequestResult> WindPremiumFiles([FromForm] List<IFormFile> files, [FromForm] WindForecastFullRequest request)
        {

            try
            {
                JobsRecord jobsRecord = new JobsRecord();
                jobsRecord.JobKey =  DataStaticHelpers.GenerateSmallGuid();;
                jobsRecord.Datetime = DateTime.Now;
                jobsRecord.DatetimeStr = DateTime.Now.ToShortDateString();
                jobsRecord.EnergySource = JobsTypesFilters.wind;
                jobsRecord.Parameters = JsonConvert.SerializeObject(request);
                jobsRecord.Progress = JobsTypesFilters.pending;
                jobsRecord.Plan = JobsTypesFilters.premium;
                jobsRecord.DownloadUrls = ["https://hyrefapp.dev.desp.space/downloads/wind_speed_timeseries.csv"];
                jobsRecord.Comments = "No comments";
                jobsRecord.UploadedFiles = ["https://hyrefapp.dev.desp.space/downloads/wind_speed_timeseries.csv"];
                jobsRecord.ForType = JobsTypesFilters.forecast;

                var jobcreated = _jobService.CreateJob(jobsRecord, this.LoggedUser);
                var response = new ForecastJobRequestResult { jobId = "myGuid", message = "success", status = 0 };
                return Ok(response);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at Premium Wind File",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }

        }


        */


        #endregion


        #region Visualize Data for Forecast

        [HttpGet("wind/visualize")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<ForecastWindBasicResponse>> VisualizeWind([FromQuery] string jobKey, [FromQuery] string responseKey)
        {
            try
            {
                var result = await _jobService.JobResponsePayload<ExtWindForecastFulResponse>(jobKey);
                if (result != null)
                {
                    ForecastWindBasicResponse forecast = new ForecastWindBasicResponse();
                     
                    forecast.forecastVSTime = result.forecastvstime.Select(f => new WindPowerSpeed
                    { dateTime= f.datetime,
                    powerOutput = f.poweroutput,
                    windspeed = f.windspeed,
                    step = f.step
                    }).ToList();

                    

                    forecast.jobtype = "forecast";
                    return Ok(forecast);
                }
                else
                {
                    ErrorResult error = new ErrorResult()
                    {
                        ErrorCode = 500,
                        ErrorMessage = "Error at Solar Visualize, no data found!",
                        ErrorDetails = "",
                        FilePath = ""
                    };
                    return StatusCode(StatusCodes.Status500InternalServerError, error);
                }


            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at Solar Visualize",
                    ErrorDetails = ex.Message,
                    FilePath = ""
                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
        }



        [HttpGet("solar/visualize")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<ForecastSolarBasicResponse>> VisualizeSolar([FromQuery] string jobKey, [FromQuery] string responseKey)
        {
            try
            {
                var result = await _jobService.JobResponsePayload<SolarForecastDataFromService>(jobKey);
                if (result != null)
                {
                    ForecastSolarBasicResponse forecast = new ForecastSolarBasicResponse();
                    List<PowerWithIrradiation> forecastVSTime = result.forecasts
                        .Select(forecast => new PowerWithIrradiation
                        {
                           dateTime = forecast.timestamp,
                            power = StaticGlobalHelpers.ReduceDecimals(forecast.predicted_production,4),
                            irradiation = StaticGlobalHelpers.ReduceDecimals(forecast.ghi_kWhm2,4)
                        })
                        .ToList();

                    forecast.forecastVSTime = forecastVSTime;
                    forecast.jobtype = "forecast";
                    return Ok(forecast);
                }
                else
                {
                    ErrorResult error = new ErrorResult()
                    {
                        ErrorCode = 500,
                        ErrorMessage = "Error at Solar Visualize, no data found!",
                        ErrorDetails = "",
                        FilePath = ""
                    };
                    return StatusCode(StatusCodes.Status500InternalServerError, error);
                }


            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at Solar Visualize",
                    ErrorDetails = ex.Message,
                    FilePath = ""
                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
        }


        #endregion


        #region Validate Files
         
        [HttpPost("solar/validatefile")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<FileValidationResult>> SolarValidateFile([FromForm] IFormFile file, [FromForm] string plan, [FromForm] string type)
        {


            if (file == null || file.Length == 0 || file.ContentType != "text/csv")
            {
                FileValidationResult error = new FileValidationResult()
                {
                    message = "Not a CSV",
                    file_path = file.FileName,
                    valid = false,
                    guid="",
                    aux=""
                };

                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
            /* upload file
             * validate 
             * delete
             * then send one more
            */
  
            string jobKey = DataStaticHelpers.GenerateSmallGuid();
            string folderPath = DataStaticHelpers.GetSetting(_configuration, "SolarUploadForecast");

            string fileName = $"{jobKey}.csv"; // Unique filename
            string fullPath = Path.Combine(folderPath, fileName);
            
            
                
            var validator = new FileValidations();
            var result = new CsvValidationResult();
            
            string csvContent;
            using (var reader = new StreamReader(file.OpenReadStream()))
            {
                csvContent = await reader.ReadToEndAsync();
            }
            result = validator.ValidateSolarProductionTimeSeries(csvContent, checkInterval: false, expectedMinutes: 15);

            if (!result.IsValid)
            {
                // CSV is invalid
                FileValidationResult fileValidationError = new FileValidationResult();
                fileValidationError.valid = false;
                fileValidationError.message = string.Join(", ", result.Errors);
                fileValidationError.file_path = file.FileName;
                fileValidationError.guid = "";
                return StatusCode(StatusCodes.Status500InternalServerError, fileValidationError);
            }

            try
            {

                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }


                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                if (!file.FileName.Contains("enolocal")) 
                {
                    var noaValidation = await SendCsvValidationRequestAsync(_configuration, fullPath);

                    if (!noaValidation.valid)
                    {
                        FileValidationResult error = new FileValidationResult()
                        {
                            message = noaValidation.message,
                            file_path = fullPath,
                            valid = false,
                            guid = "",
                            aux = ""
                        };

                        if (System.IO.File.Exists(fullPath))
                        {
                            System.IO.File.Delete(fullPath);
                        }

                        return StatusCode(StatusCodes.Status500InternalServerError, error);
                    }
                }
              
            }
            catch (Exception ex)
            {
                FileValidationResult error = new FileValidationResult()
                {
                    message = ex.Message,
                    file_path = fullPath,
                    valid = false,
                    guid = "",
                    aux = ""
                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }


            FileValidationResult successResult = new FileValidationResult()
            {
                message = "success",
                file_path = fullPath,
                valid = true,
                guid = jobKey,
                aux = result.FirstDate.Value.DateTime.ToString("yyyy-MM-dd") + "|" + result.LastDate.Value.DateTime.ToString("yyyy-MM-dd")
            };
            return StatusCode(StatusCodes.Status200OK, successResult);

            /*

            if (source == JobsTypesFilters.solar)
            {

                //delete temp_file
                string jobKey = "sjk_0000";
                string folderPath = "/dredata/solar/uploaded/";
                string fileName = $"{this.LoggedUser.Email.Replace("@", "_").Replace(".", "_") + "_" + jobKey}.csv"; // Unique filename
                string fullPath = Path.Combine(folderPath, fileName);

                try
                {

                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }


                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }



                    string validationResult = await SendCsvValidationRequestAsync(folderPath + fileName);



                    return StatusCode(StatusCodes.Status200OK, $"File is valid!, validation:" + validationResult);
                }
                catch (Exception ex)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, "File save error: " + ex.Message);
                }



            }
            else
            {
                //Wind validate upload.
                return StatusCode(StatusCodes.Status406NotAcceptable, "Wind not yet implemented");
            }

            */


        }


        static async Task<FileValidationResult> SendCsvValidationRequestAsync(IConfiguration configuration, string fullPath)
        {
            var url = DataStaticHelpers.GetSetting(configuration, "NoaSolarValidate"); //"https://hyrefapp.dev.desp.space/solarcore/validate-csv/";

  

            var payload = new { file_path = fullPath };

            using var httpClient = new HttpClient();

            // Serialize payload to JSON
            var json = serial.JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                var response = await httpClient.PostAsync(url, content);
                string responseBody = await response.Content.ReadAsStringAsync();
                var result = serial.JsonSerializer.Deserialize<ExtSolarValidationFileError>(responseBody);

                if (response.IsSuccessStatusCode)
                {
                    FileValidationResult solarValidationResult = new FileValidationResult();
                    solarValidationResult.valid = true;
                    solarValidationResult.message = "";
                    solarValidationResult.file_path = fullPath;
                    solarValidationResult.aux = "";
                    solarValidationResult.guid = "";
                    return (solarValidationResult);
                }
                else
                {
                    FileValidationResult solarValidationResult = new FileValidationResult();
                    solarValidationResult.valid = false;
                    solarValidationResult.message = serial.JsonSerializer.Serialize(result.errors);
                    solarValidationResult.file_path = fullPath;
                    solarValidationResult.aux = "";
                    solarValidationResult.guid = "";
                    return (solarValidationResult);
                }


            }
            catch (Exception ex)
            {
                FileValidationResult solarValidationResult = new FileValidationResult();
                solarValidationResult.valid = false;
                solarValidationResult.message = "Error: " + ex.Message;
                solarValidationResult.file_path = fullPath;
                solarValidationResult.aux = "";
                solarValidationResult.guid = "";
                return (solarValidationResult);
            }
        }
 
        [HttpPost("wind/validatefile")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<FileValidationResult>> WindValidateFile([FromForm] IFormFile[] file, [FromForm] string plan, [FromForm] string type)
        {


            if (file == null || file.Length == 0)
            {
                FileValidationResult error = new FileValidationResult()
                {
                    message = "Missing files",
                    file_path = "",
                    valid = false,
                    guid = "",
                    aux = ""
                };

                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }

            var totalFiles = file.Length;

            List< FileValidationResult > fileValidationResults = new List<FileValidationResult>();


            foreach (var uploadedFile in file)
            {
            
                if (uploadedFile.ContentType != "text/csv")
                {
                    FileValidationResult error = new FileValidationResult()
                    {
                        message = "Not a CSV",
                        file_path = "",
                        valid = false,
                        guid = "",
                        aux = ""
                    };

                    fileValidationResults.Add(error);
                    break;
                }


                if (uploadedFile.FileName!= JobsTypesFilters.powercurve + ".csv" && (uploadedFile.FileName != JobsTypesFilters.traindata + ".csv"))
                {
                    FileValidationResult error = new FileValidationResult()
                    {
                        message = "Wrong file name:" + uploadedFile.FileName,
                        file_path = "",
                        valid = false,
                        guid = "",
                        aux = ""
                    };

                    fileValidationResults.Add(error);
                    break;
                }

            

                try
                {
                    string csvContent;
                    using (var reader = new StreamReader(uploadedFile.OpenReadStream()))
                    {
                        csvContent = await reader.ReadToEndAsync();
                    }

                    var validator = new FileValidations();
                    var result = new CsvValidationResult();
       
                    if (uploadedFile.FileName == JobsTypesFilters.powercurve+".csv")
                    {
                         result = validator.ValidateWindPowerCurve(csvContent);
                    }
                   
                    if (uploadedFile.FileName == JobsTypesFilters.traindata + ".csv")
                    {
                        result = validator.ValidateWindTrainData(csvContent);
                    }

                    if (!result.IsValid)
                    {
                        // CSV is invalid
                        FileValidationResult fileValidationError = new FileValidationResult();
                        fileValidationError.valid = false;
                        fileValidationError.message = string.Join(", ", result.Errors);
                        fileValidationError.file_path = uploadedFile.FileName;
                        fileValidationError.guid = "";
                        fileValidationResults.Add(fileValidationError);
                    }

                }
                catch (Exception ex)
                {
                    FileValidationResult error = new FileValidationResult()
                    {
                        message = ex.Message,
                        file_path = uploadedFile.FileName,
                        valid = false,
                        guid = "",
                        aux = ""

                    };
                    fileValidationResults.Add(error);
                }

            }

            if (fileValidationResults.Count>0)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, fileValidationResults);
            }
           
            //if Validation of all files is finished, then store them!
            string folderPath = DataStaticHelpers.GetSetting(_configuration, "WindUploadForecast");
            string jobKey = DataStaticHelpers.GenerateSmallGuid();
            folderPath = Path.Combine(folderPath, jobKey);

            List<string> paths = new List<string>();
            string fullPath = "";

            try
            {
                foreach (var uploadedFile in file)
                {

                    fullPath = Path.Combine(folderPath, uploadedFile.FileName);

                    if (!Directory.Exists(folderPath))
                    {
                        Directory.CreateDirectory(folderPath);
                    }

                    using (var stream = new FileStream(fullPath, FileMode.Create))
                    {
                        await uploadedFile.CopyToAsync(stream);
                    }
                  
                    paths.Add(fullPath);
                }

           
            }
            catch (Exception ex)
            {
                //not stored
                FileValidationResult error = new FileValidationResult()
                {
                    message = ex.Message,
                    file_path = fullPath,
                    valid = false,
                    guid = "",
                    aux = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }


            FileValidationResult fileValidationResult = new FileValidationResult();
            fileValidationResult.valid = true;
            fileValidationResult.message = "Success";
            fileValidationResult.file_path = string.Join("|", paths);
            fileValidationResult.guid = jobKey;
            fileValidationResult.aux = "";
            return StatusCode(StatusCodes.Status200OK, fileValidationResult);


        }


        #endregion

    }

    public static class DummyAbout
    {
        public static ForecastSolarBasicResponse GenerateDummyDataSolar()
        {
            var response = new ForecastSolarBasicResponse
            {
                forecastVSTime = new List<PowerWithIrradiation>(),
                realvsforecast = new List<OutputVSForecast>(),
                csvLink = new string[]
                {
                "https://hyrefapp.dev.desp.space/downloads/wind_speed_timeseries.csv",
                "https://hyrefapp.dev.desp.space/downloads/wind_speed_timeseries.csv"
                },
                jobtype = "forecast"
            };

            // Create 10 dummy entries for forecastVSTime and realvsforecast.
            for (int i = 0; i < 10; i++)
            {
                // Dummy forecast data with a simple pattern
                response.forecastVSTime.Add(new PowerWithIrradiation
                {
                    power = 100 + i * 10,            // e.g. 100, 110, 120, ...
                    irradiation = 50 + i * 5,          // e.g. 50, 55, 60, ...
                    dateTime = DateTime.Now.AddHours(i)
                });

                // Dummy real vs forecast data
                response.realvsforecast.Add(new OutputVSForecast
                {
                    powerOutput = 90 + i * 8,          // e.g. 90, 98, 106, ...
                    powerForecast = 100 + i * 9,         // e.g. 100, 109, 118, ...
                    step = i,
                    dateTime = DateTime.Now.AddHours(i)
                });
            }

            return response;
        }

        public static ForecastWindBasicResponse GenerateDummyDataWind()
        {
            var response = new ForecastWindBasicResponse
            {
                forecastVSTime = new List<WindPowerSpeed>(),
                realvsforecast = new List<OutputVSForecast>(),
                csvLink = new string[]
                {
                "https://hyrefapp.dev.desp.space/downloads/wind_speed_timeseries.csv",
                "https://hyrefapp.dev.desp.space/downloads/wind_speed_timeseries.csv"
                },
                jobtype = "forecast"    
            };

            // Create 10 dummy entries for forecastVSTime and realvsforecast.
            for (int i = 0; i < 10; i++)
            {
                // Dummy forecast data with a simple pattern
                response.forecastVSTime.Add(new WindPowerSpeed
                {
                    windspeed = 100 + i * 10,            // e.g. 100, 110, 120, ...
                   powerOutput = 50 + i * 5,          // e.g. 50, 55, 60, ...
                    step=i,
                    dateTime = DateTime.Now.AddHours(i)
                });

                // Dummy real vs forecast data
                response.realvsforecast.Add(new OutputVSForecast
                {
                    powerOutput = 90 + i * 8,          // e.g. 90, 98, 106, ...
                    powerForecast = 100 + i * 9,         // e.g. 100, 109, 118, ...
                    step = i,
                    dateTime = DateTime.Now.AddHours(i)
                });
            }

            return response;
 
        }
    }

}
