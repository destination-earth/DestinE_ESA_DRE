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


namespace WebApi.Controllers
{
    [Authorize]
    /*[ApiController]
    [Route("[controller]")]*/

    public class UsersController(IServiceProvider serviceProvider) : BaseController<UsersController>(serviceProvider)
    {
        //private readonly IJobService _jobsService = serviceProvider.GetRequiredService<IJobService>();
        //private readonly IConfiguration _iConfig;

        [HttpGet("initialize")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<string> Initialize([FromQuery] string asset, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            return Ok("Initialize method for users page");
        }


    }
}
