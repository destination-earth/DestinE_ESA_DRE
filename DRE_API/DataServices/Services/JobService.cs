using System;
using System.Collections.Generic;
using System.Linq;
using WebApiData.Entities;
using WebApiData.Helpers;
using Interfaces;
using DataServices.Models;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using System.Net;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;

namespace WebApiData.Services
{

    public class JobService : IJobService
    {
        private readonly DataContext _context;

        public JobService(DataContext context)
        {
            _context = context;
        }

        public async Task<Jobs> UserJAllobsCheck( )
        {
            var allJobs = await _context.JobsDb.ToListAsync();

            var jobsList = new List<JobsRecord>();

            foreach (var j in allJobs)
            {
                jobsList.Add(new JobsRecord
                {
                    // For demo purposes, JobKey and Datetime are set to current time with a slight offset.
                    JobKey = j.JobKey,
                    DatetimeStr = j.Datetime.ToShortDateString(),
                    Datetime = j.Datetime,
                    EnergySource = j.EnergySource,
                    Plan = j.Plan,
                    Progress = j.Progress,
                    Parameters = j.Parameters,
                    DownloadUrls = j.DownloadUrl.Split(','),
                });
            }

            Jobs userJobs = new()
            {
                JobList = jobsList,
                Helper = "helper, not used"
            };
            return userJobs;

        }
        public async Task<FullJobs> UserJobsCheck(string jobKey)
        {

        
            var selectedJob =new JobsDb();
            if (jobKey != null)
            {
                if (!string.IsNullOrEmpty(jobKey))
                {
                     selectedJob =  await _context.JobsDb.Where(j => j.JobKey==jobKey ).FirstOrDefaultAsync();
                }
            }
 
 
              var jobRecord = new JobsRecord()
                {
                    JobKey = selectedJob.JobKey,
                    DatetimeStr = selectedJob.Datetime.ToShortDateString(),
                    Datetime = selectedJob.Datetime,
                    EnergySource = selectedJob.EnergySource,
                    Plan = selectedJob.Plan,
                    Progress = selectedJob.Progress,
                    Parameters = selectedJob.Parameters,
                  DownloadUrls = selectedJob.DownloadUrl.Split(',')
              };


            var result = await _context.JobsResponses
                     .Where(j => j.JobId == selectedJob.Id)
                     .Select(jr => new JobsResponses()
                     {
                       Id=  jr.Id,
                        JobId= jr.JobId,
                         Datetime= jr.Datetime,
                         Payload= jr.Payload,


                         EnergySource=jr.EnergySource,
                         Status=jr.Status,
                         Error = jr.Error,
                         
                         Files = jr.Files.Select(f => new JobFiles
                         {
                             
                            Filename = f.Filename,
                            FilePath= f.FilePath,
                            
                         }).ToList()
                     })
                     .ToListAsync();


            FullJobs fullJob = new()
            {
                Job = jobRecord,
                JobsResponses = result,
            };

            return fullJob;

        }
     
        public async Task<Jobs> UserJobs(ILoggedUser user, JobsFilters jobsFilters)
        {
            // Step 1: LEFT JOIN query with filters — still runs in SQL
            var query = from job in _context.JobsDb
                        join response in _context.JobsResponses
                        on job.Id equals response.JobId into jobResponses
                        from response in jobResponses.DefaultIfEmpty()
                        where job.UserEmail.ToLower() == user.Email.ToLower()
                              && job.IsDeleted == false
                              && job.IsUivisible == true
                        select new { job, response };

            // Step 2: Apply jobsFilters
            if (jobsFilters != null)
            {
                if (!string.IsNullOrEmpty(jobsFilters.Type))
                {
                    query = query.Where(x => x.job.ForType.ToLower() == jobsFilters.Type.ToLower());
                }

                if (!string.IsNullOrEmpty(jobsFilters.Source))
                {
                    query = query.Where(x => x.job.EnergySource.ToLower() == jobsFilters.Source.ToLower());
                }

                if (!string.IsNullOrEmpty(jobsFilters.Plan))
                {
                    query = query.Where(x => x.job.Plan.ToLower() == jobsFilters.Plan.ToLower());
                }
            }

            // Step 3: Pull to memory for projection with DownloadUrls
            var rawJobs = await query.ToListAsync();

            // Step 4: Project to JobsRecord
            var allJobs = rawJobs
                .Select(x => new JobsRecord
                {
                    JobKey = x.response != null ? $"{x.job.JobKey}_{x.response.Id}" : x.job.JobKey,
                    DatetimeStr = x.job.Datetime.ToShortDateString(),
                    Datetime = x.job.Datetime,
                    EnergySource = x.job.EnergySource,
                    Plan = x.job.Plan,
                    Progress = x.job.Progress,
                    Parameters = x.job.Parameters,
                    DownloadUrls = x.response != null
                        ? _context.JobFiles
                            .Where(f => f.JobResponseId == x.response.Id)
                            .Select(f => f.FilePath)
                            .ToArray()
                        : Array.Empty<string>()
                })
                .OrderByDescending(x => x.Datetime)
                .ToList();

            Jobs userJobs = new()
            {
                JobList = allJobs,
                Helper = "helper, not used"
            };
            return userJobs;

        }


        public async Task<JobsDb> SpecificJob(ILoggedUser user, string jobKey)
        {
            if (!jobKey.Contains("_", StringComparison.CurrentCulture))
            {
                throw new InvalidOperationException("No response is found.");
            }
            string onlyKey = jobKey.Split('_')[0];
            var job = await _context.JobsDb.FirstOrDefaultAsync(j => j.JobKey == onlyKey && j.UserEmail == user.Email) ?? throw new ArgumentException($"No job found with key: {jobKey}");
            return job;
        }

        public async Task<GenericActionResult> JobResult(JobFinished jobActionResult)
        {
            try
            {
                var job = await _context.JobsDb.FirstOrDefaultAsync(j => j.JobKey == jobActionResult.JobKey);

                if (job == null)
                {
                    GenericActionResult genericActionResult = new()
                    {
                        HttpStatus = (int)HttpStatusCode.NotFound,
                        HasError = true,
                        Message = "Job not found"
                    };
                    return genericActionResult;
                }

                var jobsResponses = new JobsResponses
                {
                    JobId = job.Id,
                    Status = jobActionResult.Status,
                    Error = jobActionResult.Error,
                    Datetime = jobActionResult.Datetime.ToUniversalTime(),
                    //DatetimeFrom = jobActionResult.DatetimeFrom.ToUniversalTime(),
                    //DatetimeTo = jobActionResult.DatetimeTo.ToUniversalTime(),
                    Payload = jobActionResult.Payload.ToString(),
                    
                    Files = [] // optional pre-init
                };

                _context.JobsResponses.Add(jobsResponses);
                await _context.SaveChangesAsync();
 
                foreach (var file in jobActionResult.Files)
                {
                    var jobFile = new JobFiles
                    {
                        JobResponseId = jobsResponses.Id,
                        Filename = file.FriendlyName,
                        FilePath = file.Path,
                        FileSize = file.Size
                    };
                    _context.JobFiles.Add(jobFile);
                }

                job.Progress = JobsTypesFilters.completed;
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                GenericActionResult errorResult = new()
                {
                    HttpStatus = (int)HttpStatusCode.NotFound,
                    HasError = true,
                    Message = ex.Message
                };
                return errorResult;
            }

            GenericActionResult okResult = new()
            {
                HttpStatus = (int)HttpStatusCode.OK,
                HasError = false,
                Message = "Success"
            };
            return okResult;
        }
        public async Task<GenericActionResult> JobUpdate(JobUpdateProgress jobUpdateResult)
        {
            try
            {
                var job = await _context.JobsDb.FirstOrDefaultAsync(j => j.JobKey == jobUpdateResult.JobKey);

                if (job == null)
                {
                    GenericActionResult genericActionResult = new()
                    {
                        HttpStatus = (int)HttpStatusCode.NotFound,
                        HasError = true,
                        Message = "Job not found"
                    };
                    return genericActionResult;
                }

                job.Progress = jobUpdateResult.Status;
                job.Datetime = DateTime.Now.ToUniversalTime();
                job.Comments = jobUpdateResult.Description;


                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                GenericActionResult errorResult = new()
                {
                    HttpStatus = (int)HttpStatusCode.NotFound,
                    HasError = true,
                    Message = ex.Message
                };
                return errorResult;
            }

            GenericActionResult okResult = new()
            {
                HttpStatus = (int)HttpStatusCode.OK,
                HasError = false,
                Message = "Success"
            };
            return okResult;
        }

        public async Task<T> JobResponsePayload<T>(string jobKey)
        {

            if (!jobKey.Contains("_", StringComparison.CurrentCulture))
            {
                throw new InvalidOperationException("No response is found.");
            }


            string onlyKey = jobKey.Split('_')[0];
            string responseKey = jobKey.Split('_')[1];

            if (responseKey.IsNullOrEmpty())
            {
                throw new InvalidOperationException("No response is found.");
            }

            var job = await _context.JobsDb.FirstOrDefaultAsync(j => j.JobKey == onlyKey) ?? throw new ArgumentException($"No job found with key: {jobKey}");
            var query = await _context.JobsResponses.FirstOrDefaultAsync(j => j.JobId == job.Id && j.Id==int.Parse(responseKey));

            if (query == null || string.IsNullOrEmpty(query.Payload))
                throw new InvalidOperationException("No payload is found.");

            try
            {
                var jobPayload = JsonSerializer.Deserialize<T>(query.Payload);
                return jobPayload;
            }
            catch (JsonException ex)
            {
                throw new InvalidOperationException("Failed to deserialize job response payload.", ex);
            }
        }

        public bool CreateJob(JobsRecord job, ILoggedUser user, string answer)
        {
            string email = user == null ? "no_user" : user.Email;

            try
            {
                JobsDb jobsDb = new()
                {
                    JobKey = job.JobKey,
                    Datetime = job.Datetime.ToUniversalTime(),
                    Plan = job.Plan,
                    EnergySource = job.EnergySource.ToLower(),
                    Parameters = job.Parameters,
                    Progress = job.Progress,
                    DownloadUrl = "",
                    Comments = job.Comments,
                    ForType = job.ForType,
                    KeyHandler = job.JobKey,
                    UserEmail = email,
                    UploadedFile = string.Join(",", job.UploadedFiles),
                    IsDeleted = false,
                    IsUivisible = true,
                    Answer= answer,
                    StatusCode=0
                };

                _context.JobsDb.Add(jobsDb);
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception("CreateJob", ex);
            }

        }

        public async Task<List<JobResponseUI>> JobsResponses(ILoggedUser user, string jobKey)
        {
            var job = await _context.JobsDb.FirstOrDefaultAsync(JobsDb => JobsDb.UserEmail == user.Email &&  JobsDb.JobKey == jobKey );

            var jobsResponses = await _context.JobsResponses.Where(j => j.JobId==job.Id).ToListAsync();

            var jobsResponseList = new List<JobResponseUI>();

            foreach (var j in jobsResponses)
            {
                jobsResponseList.Add(new JobResponseUI
                {
                    JobKey = job.JobKey,
                    Dates = j.Datetime.ToShortDateString(),
                    Plan = job.Plan,
                    RessponseId = j.Id.ToString(), // j.Id.ToString(), TODO: change with local key when ready!
                    Source = j.EnergySource,
                    Type = job.ForType,

                });
            }

 
            return jobsResponseList;

        }

        #region To use with manager
        public async Task<Jobs> NextJobs()
        {
            var query = _context.JobsDb.AsQueryable();
            query = query.Where(j => j.Progress.ToLower() == JobsTypesFilters.finished || j.Progress.ToLower() == JobsTypesFilters.pending );
            var allJobs = await query.OrderBy(p => p.Datetime).ToListAsync();
            var jobsList = new List<JobsRecord>();
            foreach (var j in allJobs)
            {
                jobsList.Add(new JobsRecord
                {
                    JobKey = j.JobKey,
                    DatetimeStr = j.Datetime.ToShortDateString(),
                    Datetime = j.Datetime,
                    EnergySource = j.EnergySource,
                    Plan = j.Plan,
                    Progress = j.Progress,
                    Parameters = j.Parameters,
                    DownloadUrls = j.DownloadUrl.Split(',')
                });
            }

            Jobs userJobs = new()
            {
                JobList = jobsList,
                Helper = "helper, not used"
            };
            return userJobs;

        }

        public async Task<GenericActionResult> MarkJobProgress(JobUpdateProgress jobUpdateResult, string workingServer)
        {
            try
            {
                var job = await _context.JobsDb.FirstOrDefaultAsync(j => j.JobKey == jobUpdateResult.JobKey);

                if (job == null)
                {
                    GenericActionResult genericActionResult = new()
                    {
                        HttpStatus = (int)HttpStatusCode.NotFound,
                        HasError = true,
                        Message = "Job not found"
                    };
                    return genericActionResult;
                }

                job.Progress = jobUpdateResult.Status;


                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                GenericActionResult errorResult = new()
                {
                    HttpStatus = (int)HttpStatusCode.NotFound,
                    HasError = true,
                    Message = ex.Message
                };
                return errorResult;
            }

            GenericActionResult okResult = new()
            {
                HttpStatus = (int)HttpStatusCode.OK,
                HasError = false,
                Message = "Success"
            };
            return okResult;
        }

        #endregion




    }
}
