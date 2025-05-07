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


namespace WebApi.Controllers
{
    //[Authorize]
    /*[ApiController]
    [Route("[controller]")]*/
 
    public class PlantController(IServiceProvider serviceProvider) : BaseController<PlantController>(serviceProvider)  
    {
        private readonly ISettingsService _sensorDataService = serviceProvider.GetRequiredService<ISettingsService>();
        //private readonly IConfiguration _iConfig;

        [HttpGet("initialize")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<SettingsUI> Initialize()
        {
            var userId = LoggedUser.UserId;           
            var initData = _sensorDataService.Initialize(userId,"");
            return Ok(initData);
        }

    }
}
