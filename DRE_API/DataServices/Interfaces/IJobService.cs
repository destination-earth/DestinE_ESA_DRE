using DataServices.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using WebApiData.Entities;

namespace Interfaces
{
    public interface IJobService
    {
        Task<JobsDb> SpecificJob(ILoggedUser user, string jobKey);
        Task<Jobs> UserJobs(ILoggedUser user, JobsFilters jobsFilters);
        Task<FullJobs> UserJobsCheck(string jobKey);
        Task<Jobs> UserJAllobsCheck();
        bool CreateJob(JobsRecord job, ILoggedUser user,string answer);
        Task<GenericActionResult> JobResult(JobFinished jobActionResult);
        Task<GenericActionResult> JobUpdate(JobUpdateProgress jobUpdateResult);
        Task<T> JobResponsePayload<T>(string jobKey);
        Task<Jobs> NextJobs();
        Task<GenericActionResult> MarkJobProgress(JobUpdateProgress jobUpdateResult, string workingServer);
        Task<List<JobResponseUI>> JobsResponses(ILoggedUser user, string jobKey);
    }
}
