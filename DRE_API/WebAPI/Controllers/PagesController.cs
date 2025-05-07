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
    //[Authorize]
    /*[ApiController]
    [Route("[controller]")]*/

    public class PagesController(IServiceProvider serviceProvider) : BaseController<PagesController>(serviceProvider)
    {
        //private readonly IJobService _jobsService = serviceProvider.GetRequiredService<IJobService>();
        //private readonly IConfiguration _iConfig;

        [HttpGet("pricing")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<string> Pricing()
        {
            return Ok("Pricing");
        }


        [HttpGet("faqs")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<string> Faqs()
        {
            return Ok("faqs");
        }


        [HttpGet("documentation")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<string> Documentation()
        {
            return Ok("Documentation");
        }

    }
}
