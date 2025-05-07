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
using WebApi.Helpers.Extensions;
using System.Diagnostics;
using CSharpFunctionalExtensions;
using Microsoft.AspNetCore.Http.HttpResults;


namespace WebApi.Controllers
{
    //[Authorize]
    public class JobsController(IServiceProvider serviceProvider) : BaseController<JobsController>(serviceProvider)  
    {
        private readonly IJobService _jobsService = serviceProvider.GetRequiredService<IJobService>();
        //private readonly IConfiguration _iConfig;


        #region UI called

        [Authorize]
        [HttpGet("initialize")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<string> Initialize([FromQuery] string asset, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            return Ok("Initialize method for Assessment page");
        }


        /// <summary>
        /// Get the jobs per user, if no parameters then it returns all jobs.
        /// </summary>
        /// <param name="type">If the job is for assessment, or forecast: assessment/forecast</param>
        /// <param name="source">If it is solar or wind: solar/wind </param>
        /// <returns></returns>
        [Authorize]
        [HttpGet("userJobs")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<Jobs>> UserJobs([FromQuery] string type, [FromQuery] string source, [FromQuery] string plan)
        {
            try
            {
                JobsFilters jobsFilters = new()
                {
                    Type = type,
                    Source = source,
                    Plan = plan
                };
                var userJobs = await _jobsService.UserJobs(this.LoggedUser, jobsFilters);
                return Ok(userJobs);
            }
            catch (Exception ex)
            {

                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at getting user jobs.",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="jobKey"></param>
        /// <returns></returns>
        [Authorize]
        [HttpGet("jobdetails")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<Jobs> JobDetails(string jobKey)
        {
            try
            {
                JobsFilters jobsFilters = new();
                var userJobs = _jobsService.UserJobs(this.LoggedUser, jobsFilters);
                return Ok(userJobs);
            }
            catch (Exception ex)
            {

                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at job details",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
        }

        [Authorize]
        [HttpPost("canceljob")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<Jobs> CancelJob([FromBody] string jobKey)
        {
            //ToDo: add service with specific jobId.
            
            return Ok("Canceled or not!");
        }

        [Authorize]
        [HttpDelete("softdeletejob")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<Jobs> SoftDeleteJob([FromBody] string[] jobKey)
        {
            //ToDo: add service with specific jobId.

            return Ok("Canceled or not!");
        }




        [Authorize]
        [HttpGet("jobresponses")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<List<JobResponseUI>>> GetJobResponses([FromQuery] string jobkey)
        {
            try
            {
                var userJobs = await _jobsService.JobsResponses(this.LoggedUser, jobkey);
                return Ok(userJobs);
            }
            catch (Exception ex)
            {


                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at job responses",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
        }


        #endregion


        [CustomTokenAuthorizeAttribute]
        [HttpGet("jobscheck")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<FullJobs>> JobCheck([FromQuery] string jobkey)
        {
            var userJobs = await _jobsService.UserJobsCheck(jobkey);
            return Ok(userJobs);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        [CustomTokenAuthorizeAttribute]
        [HttpGet("alljobscheck")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<Jobs>> JobCheck()
        {
            try
            {
                var userJobs = await _jobsService.UserJAllobsCheck();
                return Ok(userJobs);
            }
            catch (Exception ex)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at job check",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
        }


        [CustomTokenAuthorizeAttribute]
        [HttpPost("jobresult")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<string>> JobResult([FromBody] JobFinished jobActionResult)
        {
            try
            {
                var result = await _jobsService.JobResult(jobActionResult);

                if (result.HasError)
                {
                    ErrorResult error = new ErrorResult()
                    {
                        ErrorCode = 500,
                        ErrorMessage = "Error at job details",
                        ErrorDetails = result.Message,
                        FilePath = ""

                    };
                    return StatusCode(StatusCodes.Status500InternalServerError, error);
                }

                return Ok("The Job service responded finished a job.");
            }
            catch (Exception ex)
            {

                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at job details",
                    ErrorDetails = ex.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
        }

        [CustomTokenAuthorizeAttribute]
        [HttpPost("jobupdate")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<string>> JobUpdateProgress([FromBody] JobUpdateProgress jobActionResult)
        {
            var fromConnection = HttpContext.Connection;
            //Debug.WriteLine($"Connection: {fromConnection.RemoteIpAddress} - {fromConnection.LocalIpAddress} - {fromConnection.LocalPort}");
            var result = await _jobsService.JobUpdate(jobActionResult);
            if (result.HasError)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at job details",
                    ErrorDetails = result.Message,
                    FilePath = ""
                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
            return Ok("The Job service responded the update of a job.");
        }


        [CustomTokenAuthorizeAttribute]
        [HttpGet("nextjobs")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<string>> NextJobs()
        {
            var userJobs = await _jobsService.NextJobs();
            return Ok(userJobs);
        }


        [CustomTokenAuthorizeAttribute]
        [HttpPost("markjobprogress")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<string>> MarkJobProgress([FromBody] JobUpdateProgress jobActionResult)
        {
            var fromConnection = HttpContext.Connection;
            var result = await _jobsService.MarkJobProgress(jobActionResult, fromConnection.RemoteIpAddress.ToString());
            if (result.HasError)
            {
                ErrorResult error = new ErrorResult()
                {
                    ErrorCode = 500,
                    ErrorMessage = "Error at job details",
                    ErrorDetails = result.Message,
                    FilePath = ""

                };
                return StatusCode(StatusCodes.Status500InternalServerError, error);
            }
            return Ok("The Job service responded the update of a job.");
        }


    }

}
