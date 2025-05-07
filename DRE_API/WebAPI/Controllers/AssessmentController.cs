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


namespace WebApi.Controllers
{
    [Authorize]
    public class AssessmentController : BaseController<AssessmentController>  
    {
        //private readonly IExternalHttpService _externalHttpforecastService = serviceProvider.GetRequiredService<IExternalHttpService>();
        //private readonly IAssessmentService _assessmentService = serviceProvider.GetRequiredService<IAssessmentService>();
        //private readonly IJobService _jobService = serviceProvider.GetRequiredService<IJobService>();
        //private IConfiguration _configuration = serviceProvider.GetRequiredService<IConfiguration>();

      private readonly IExternalHttpService _externalHttpforecastService;
        private readonly IAssessmentService _assessmentService;
        private readonly IJobService _jobService;
        private readonly IConfiguration _configuration;

        public AssessmentController(IServiceProvider serviceProvider) : base(serviceProvider)
        {
            _externalHttpforecastService = serviceProvider.GetRequiredService<IExternalHttpService>();
            _assessmentService = serviceProvider.GetRequiredService<IAssessmentService>();
            _jobService = serviceProvider.GetRequiredService<IJobService>();
            _configuration = serviceProvider.GetRequiredService<IConfiguration>();


            int decimalNumbers = 4;
        
            TypeAdapterConfig<CountWindSpeed, XYValues>.NewConfig()
                .Map(dest => dest.xvalue, src => StaticGlobalHelpers.ReduceDecimals(src.X, decimalNumbers))
                 .Map(dest => dest.yvalue, src => StaticGlobalHelpers.ReduceDecimals(src.pdf, decimalNumbers));

            TypeAdapterConfig<Windspeedrange, WindSpeedRange>.NewConfig()
              .Map(dest => dest.Label, src => src.label)
              .Map(dest => dest.Data,
                  src => src.data != null
                      ? src.data
                          .Where(d => d.HasValue)
                          .Select(d => StaticGlobalHelpers.ReduceDecimals(d, decimalNumbers)) 
                          .ToArray()
                      : new double[] { });


            TypeAdapterConfig<WindStatisticsRecord, DirectionalOutput>.NewConfig()
             .Map(dest => dest.weibullShape, src => StaticGlobalHelpers.ReduceDecimals(src.weibull_shape, decimalNumbers))
             .Map(dest => dest.weibullScale, src => StaticGlobalHelpers.ReduceDecimals(src.weibull_scale, decimalNumbers))
             .Map(dest => dest.nineFive, src => StaticGlobalHelpers.ReduceDecimals(src.nine_five, decimalNumbers))
             .Map(dest => dest.nineSeven, src => StaticGlobalHelpers.ReduceDecimals(src.nine_seven ,decimalNumbers))
             .Map(dest => dest.nineNine, src => StaticGlobalHelpers.ReduceDecimals(src.nine_nine, decimalNumbers))
             .Map(dest => dest.direction, src => src.direction)
             .Map(dest => dest.frequency, src => StaticGlobalHelpers.ReduceDecimals(src.frequency, decimalNumbers))
             .Map(dest => dest.mean, src => StaticGlobalHelpers.ReduceDecimals(src.mean, decimalNumbers));



            TypeAdapterConfig<TimeSeries, WindBasicResponseComplex>.NewConfig()
                .Map(dest => dest.datetime, src => src.datetime.HasValue ? src.datetime.Value.ToString("yyyy-MM-ddTHH:mm:ss") : null)
                .Map(dest => dest.power_in_kW, src => StaticGlobalHelpers.ReduceDecimals(src.power_kW, decimalNumbers))
                .Map(dest => dest.wind_speed_in_m_per_s, src => StaticGlobalHelpers.ReduceDecimals(src.wind_speed, decimalNumbers))
                .Map(dest => dest.wind_direction_in_deg, src => StaticGlobalHelpers.ReduceDecimals(src.wind_direction, decimalNumbers));

            TypeAdapterConfig<RoseDiagram, RoseDiagramData>.NewConfig()
                .Map(dest => dest.directions, src => src.directions != null ? src.directions.ToArray() : new string[] { })
                .Map(dest => dest.windSpeedRange, src => src.windspeedrange.Adapt<List<WindSpeedRange>>());



            TypeAdapterConfig<ExtWindFullResponse, WindBasicResponse>.NewConfig()
                .Map(dest => dest.CountWindSpeed, src => src.wind_statistics.count_wind_speed.Adapt<List<XYValues>>())
                .Map(dest => dest.directionalOutputs, src => src.wind_statistics.wind_statistics_record.Adapt<List<DirectionalOutput>>())
                .Map(dest => dest.roseDiagram, src => src.wind_statistics.rose_diagram.Adapt<RoseDiagramData>())
                .Map(dest => dest.csvLink, src => new string[] { }) // Empty, unless you have real CSV download links
                .Map(dest => dest.jobtype, src => "assessment")    // Static "assessment" string
                .Map(dest => dest.complex, src => src.time_series.Adapt<List<WindBasicResponseComplex>>());



        }

        [HttpGet("initialize")]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public ActionResult<string> Initialize()
        {
            return Ok("Initialize method for Assessment page");
        }

        #region Solar Methods

        [HttpGet("solar/about")]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(SolarBasicResponse), StatusCodes.Status200OK)]
        public ActionResult<SolarBasicResponse> AboutSolar()
        {
            //var u = this.LoggedUser;
            try
            {
                var response = _assessmentService.AboutSolar();
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
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(AssessmentJobRequestResult), StatusCodes.Status200OK)]
        public async Task<ActionResult<AssessmentJobRequestResult>> SolarBasic([FromBody] SolarBasicRequest request)
        {
            try
            {
                JobsRecord jobsRecord = new JobsRecord();
                jobsRecord.JobKey = DataStaticHelpers.GenerateSmallGuid(); ;
                jobsRecord.Datetime = DateTime.Now;
                jobsRecord.DatetimeStr = DateTime.Now.ToShortDateString();
                jobsRecord.EnergySource = JobsTypesFilters.solar;
                jobsRecord.Parameters = JsonConvert.SerializeObject(request);
                jobsRecord.Progress = JobsTypesFilters.pending;
                jobsRecord.Plan = JobsTypesFilters.basic;
                jobsRecord.DownloadUrls = [];
                jobsRecord.Comments = "No comments";
                jobsRecord.UploadedFiles = [];
                jobsRecord.ForType = JobsTypesFilters.assessment;

                ExtSolarBasicAssessmentRequest dataPayload = new ExtSolarBasicAssessmentRequest();
                dataPayload.jobKey = jobsRecord.JobKey;
                dataPayload.latitude = request.latitude;
                dataPayload.longitude = request.longitude;
                dataPayload.startDate = request.startDate;
                dataPayload.endDate = request.endDate;


                var result = await _externalHttpforecastService.ProcessSolarAssessmentBasicAsync(dataPayload);
                if (result.hasError)
                {
                    ErrorResult error = new ErrorResult()
                    {
                        ErrorCode = 500,
                        ErrorMessage = "Error at Basic Solar",
                        ErrorDetails = result.error,
                        FilePath = ""
                    };
                    return StatusCode(StatusCodes.Status500InternalServerError, error);
                }


                var jobcreated = _jobService.CreateJob(jobsRecord, this.LoggedUser, result.response);
                var response = new AssessmentJobRequestResult { jobId = jobsRecord.JobKey, message = "Success", status = 200 };

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


        [HttpPost("solar/premium")]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(AssessmentJobRequestResult), StatusCodes.Status200OK)]
        public async Task<ActionResult<AssessmentJobRequestResult>> SolarPremium([FromBody] SolarPremiumRequest request)
        {

            try
            {
                JobsRecord jobsRecord = new JobsRecord();
                jobsRecord.JobKey =  DataStaticHelpers.GenerateSmallGuid();;
                jobsRecord.Datetime = DateTime.Now;
                jobsRecord.DatetimeStr = DateTime.Now.ToShortDateString();
                jobsRecord.EnergySource = JobsTypesFilters.solar;
                jobsRecord.Parameters = JsonConvert.SerializeObject(request);
                jobsRecord.Progress = JobsTypesFilters.pending;
                jobsRecord.Plan = JobsTypesFilters.premium;
                jobsRecord.DownloadUrls = [];
                jobsRecord.Comments = "No comments";
                jobsRecord.UploadedFiles = [];
                jobsRecord.ForType = JobsTypesFilters.assessment;
    

                ExtSolarPremiumAssessmentRequest dataPayload = new ExtSolarPremiumAssessmentRequest();
                dataPayload.jobKey = jobsRecord.JobKey;
                dataPayload.latitude = request.latitude;
                dataPayload.longitude = request.longitude;
                dataPayload.startDate = request.startDate;
                dataPayload.endDate = request.endDate;
                dataPayload.azimuth = request.azimuth;
                dataPayload.tilt = request.tilt;
                dataPayload.capacity = request.capacity;
                dataPayload.tracking = request.tracking;


                var result = await _externalHttpforecastService.ProcessSolarAssessmentPremiumAsync(dataPayload);
                if (result.hasError)
                {
                    ErrorResult error = new ErrorResult()
                    {
                        ErrorCode = 500,
                        ErrorMessage = "Error at Premium Solar",
                        ErrorDetails = result.error,
                        FilePath = ""
                    };
                    return StatusCode(StatusCodes.Status500InternalServerError, error);
                }


                var jobcreated = _jobService.CreateJob(jobsRecord, this.LoggedUser, result.response);
                var response = new AssessmentJobRequestResult { jobId = jobsRecord.JobKey, message = "Success", status = 200 };
                return Ok(response);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at Premium Solar",
                    ErrorDetails = ex.Message,
                    FilePath = ""
                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }

        }

        #endregion

        #region Wind Methods

        [HttpGet("wind/about")]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(WindBasicResponse), StatusCodes.Status200OK)]
        public ActionResult<WindBasicResponse> AboutWind()
        {
            var response = _assessmentService.AboutWind();
            return Ok(response);
        }


        [HttpPost("wind/basic")]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(AssessmentJobRequestResult), StatusCodes.Status200OK)]
        public async Task<ActionResult<AssessmentJobRequestResult>> WindBasic([FromBody] WindBasicRequest request)
        {

            try
            {
                var curveModel = ""; //no file upload
                bool useTrainData = false;

                JobsRecord jobsRecord = new JobsRecord();
                jobsRecord.JobKey = DataStaticHelpers.GenerateSmallGuid();
                jobsRecord.UploadedFiles = [];
                jobsRecord.Datetime = DateTime.Now;
                jobsRecord.DatetimeStr = DateTime.Now.ToShortDateString();
                jobsRecord.EnergySource = JobsTypesFilters.wind;
                jobsRecord.Parameters = JsonConvert.SerializeObject(request);
                jobsRecord.Progress = JobsTypesFilters.pending;
                jobsRecord.Plan = JobsTypesFilters.basic;
                jobsRecord.DownloadUrls = [];
                jobsRecord.Comments = "No comments";

                jobsRecord.ForType = JobsTypesFilters.assessment;


                ExtWindAssessmentBasicRequest dataPayload = new ExtWindAssessmentBasicRequest();
                dataPayload.jobKey = jobsRecord.JobKey;
                dataPayload.latitude = request.latitude.ToString();
                dataPayload.longitude = request.longitude.ToString();
                dataPayload.startDate = request.startDate;
                dataPayload.endDate = request.endDate;
                dataPayload.power_curve = curveModel;
                dataPayload.height = request.height.ToString();
                dataPayload.use_train_data = useTrainData;

                var result = await _externalHttpforecastService.WindAssessmentBasicAsync(dataPayload);
                if (result.hasError)
                {
                    ErrorResult error = new ErrorResult()
                    {
                        ErrorCode = 500,
                        ErrorMessage = "Error at Basic Wind",
                        ErrorDetails = result.error,
                        FilePath = ""
                    };
                    return StatusCode(StatusCodes.Status500InternalServerError, error);
                }


                var jobcreated = _jobService.CreateJob(jobsRecord, this.LoggedUser, result.response);
                var response = new AssessmentJobRequestResult { jobId = jobsRecord.JobKey, message = "Success", status = 200 };
                return Ok(response);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at Premium Wind",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }




        }


        [HttpPost("wind/premium")]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(AssessmentJobRequestResult), StatusCodes.Status200OK)]
        public async Task<ActionResult<AssessmentJobRequestResult>> WindPremium([FromBody] WindPremiumRequest request)
        {


            try
            {
                bool useTrainData = false;
                bool isCurveData = request.curveModel.IsNullOrEmpty() ? false : true;
                var curveModel = request.curveModel.IsNullOrEmpty() ? "" : request.curveModel;
                curveModel = curveModel.Contains("custom") ? "custom" : curveModel;


                JobsRecord jobsRecord = new JobsRecord();
                jobsRecord.JobKey = request.guid.IsNullOrEmpty() ? DataStaticHelpers.GenerateSmallGuid() : request.guid;


                if (curveModel == "custom")
                {
                    string storageFilePath = DataStaticHelpers.GetSetting(_configuration, "WindUploadAssessment");
                    storageFilePath = storageFilePath + jobsRecord.JobKey + "/" ;
                    jobsRecord.UploadedFiles = [storageFilePath];
                }
                else
                {
                    jobsRecord.UploadedFiles = [];
                }

                jobsRecord.Datetime = DateTime.Now;
                jobsRecord.DatetimeStr = DateTime.Now.ToShortDateString();
                jobsRecord.EnergySource = JobsTypesFilters.wind;
                jobsRecord.Parameters = JsonConvert.SerializeObject(request);
                jobsRecord.Progress = JobsTypesFilters.pending;
                jobsRecord.Plan = JobsTypesFilters.premium;
                jobsRecord.DownloadUrls = [];
                jobsRecord.Comments = "No comments";
          
                jobsRecord.ForType = JobsTypesFilters.assessment;


                ExtWindAssessmentPremiumRequest dataPayload = new ExtWindAssessmentPremiumRequest();
                dataPayload.jobKey = jobsRecord.JobKey;
                dataPayload.latitude = request.latitude.ToString();
                dataPayload.longitude = request.longitude.ToString();
                dataPayload.startDate = request.startDate;
                dataPayload.endDate = request.endDate;
                dataPayload.power_curve = curveModel;
                dataPayload.height = request.hubHeight.ToString();
                dataPayload.use_train_data = useTrainData;
 
                var result = await _externalHttpforecastService.WindAssessmentPremiumAsync(dataPayload);
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
                var response = new AssessmentJobRequestResult { jobId = jobsRecord.JobKey, message = "Success", status = 200 };
                return Ok(response);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at Premium Wind",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }

        }


        /*
        [HttpPost("wind/premium_file")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(AssessmentJobRequestResult), StatusCodes.Status200OK)]
        public async Task<ActionResult<AssessmentJobRequestResult>> WindPremiumWithFile([FromForm] IFormFile file, [FromForm] WindPremiumRequest request)  
        {
            var bytes = Encoding.UTF8.GetBytes("323");
            var formFile = new FormFile(new MemoryStream(bytes), 0, bytes.Length, "bitwarden_organization_license", "bitwarden_organization_license.json");

      
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
                jobsRecord.ForType = JobsTypesFilters.assessment;

                var jobcreated = _jobService.CreateJob(jobsRecord, this.LoggedUser);
                var response = _assessmentService.WindPremiumWithFile(file, request, jobsRecord.JobKey);
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

       }*/

        #endregion

        #region Visualize Methods

        [HttpGet("wind/visualize")]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<WindBasicResponse>> VisualizeWind([FromQuery] string jobKey, [FromQuery] string responseKey)
        {
            try
            {
                var job = await _jobService.SpecificJob(this.LoggedUser, jobKey);
                string plan = job.Plan;

                var result = await _jobService.JobResponsePayload<ExtWindFullResponse>(jobKey);
                var windBasicResponse = result.Adapt<WindBasicResponse>();

                if (plan== JobsTypesFilters.basic) //basic, no 
                {
                    if (windBasicResponse.complex != null)
                    {
                        var com = windBasicResponse.complex;
                        foreach (var c in com)
                        {
                            c.power_in_kW = null;
                        }


                        windBasicResponse.complex = com;
                    }
                }

                if (result.power_statistics != null && result.power_statistics.annual_stats != null)
                {
                    windBasicResponse.annual_stats = result.power_statistics.annual_stats;
                }
                else
                {
                    windBasicResponse.annual_stats = new AnnualStats();
                }

                windBasicResponse.jobtype = JobsTypesFilters.assessment;

                return Ok(windBasicResponse);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at Wind Visualize",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
        }

 
        [HttpGet("solar/visualize")]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<SolarBasicResponse>> VisualizeSolar([FromQuery] string jobKey, [FromQuery] string responseKey)
        {             
            try
            {
                var result = await _jobService.JobResponsePayload<SolarBasicResponse>(jobKey);  //!!!!!!!!!!! This is missing, I dont' have a schema for this yet
                if (result != null)
                {
                    SolarBasicResponse assessment = new SolarBasicResponse();
                    assessment.jobtype = JobsTypesFilters.assessment;
                    return Ok(assessment);
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

        # region Validate File

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

                if (response.IsSuccessStatusCode)
                {

                }
                else
                {

                }


                string responseBody = await response.Content.ReadAsStringAsync();
                var result = serial.JsonSerializer.Deserialize<FileValidationResult>(responseBody);


                return (result);
            }
            catch (Exception ex)
            {
                FileValidationResult solarValidationResult = new FileValidationResult();
                solarValidationResult.valid = false;
                solarValidationResult.message = "Error: " + ex.Message;
                solarValidationResult.file_path = fullPath;
                return (solarValidationResult);
            }
        }

        [HttpPost("wind/validatefile")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<FileValidationResult>> WindValidateFile([FromForm] IFormFile file, [FromForm] string plan, [FromForm] string type)
        {

            //I have only wind assessment, only 1 file.
            if (file == null || file.Length == 0 || file.ContentType != "text/csv")
            {
                FileValidationResult error = new FileValidationResult()
                {
                    message = "Not a CSV",
                    file_path = "",
                    valid = false,
                    guid = "",
                    aux = ""
                };

                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
            string folderPath = DataStaticHelpers.GetSetting(_configuration, "WindUploadAssessment");
            string jobKey = DataStaticHelpers.GenerateSmallGuid();
            folderPath = Path.Combine(folderPath, jobKey);

            string fullPath = Path.Combine(folderPath, "power_curve.csv");

            try
            {

                string csvContent;
                using (var reader = new StreamReader(file.OpenReadStream()))
                {
                    csvContent = await reader.ReadToEndAsync();
                }

                var validator = new FileValidations();
                var result = validator.ValidateWindPowerCurve(csvContent);

                if (!result.IsValid)
                {
                    // CSV is invalid
                    FileValidationResult fileValidationError = new FileValidationResult();
                    fileValidationError.valid = false;
                    fileValidationError.message = string.Join(", ", result.Errors);
                    fileValidationError.file_path = fullPath;
                    fileValidationError.guid = "";
                    fileValidationError.aux = "";
                    return StatusCode(StatusCodes.Status500InternalServerError, fileValidationError);
                }

                //If all OK, then store the file!

                if (!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                FileValidationResult fileValidationResult = new FileValidationResult();
                fileValidationResult.valid = true;
                fileValidationResult.message ="Success";
                fileValidationResult.file_path = fullPath;
                fileValidationResult.guid = jobKey;
                fileValidationResult.aux = "";
                return StatusCode(StatusCodes.Status200OK, fileValidationResult);
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
        }
        #endregion

    }

}
