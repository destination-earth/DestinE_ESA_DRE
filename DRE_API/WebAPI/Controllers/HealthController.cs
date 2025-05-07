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
using static CSharpFunctionalExtensions.Result;
using System.Threading.Tasks;
using System.IO;
using System.Net;
using System.Net.Http;
using MimeKit.Encodings;



namespace WebApi.Controllers
{

    public class HealthController(IServiceProvider serviceProvider) : BaseController<HealthController>(serviceProvider)
    {
        private readonly IHealthService _healthService = serviceProvider.GetRequiredService<IHealthService>();
        private readonly IConfiguration _configuration = serviceProvider.GetRequiredService<IConfiguration>();
      

        [HttpGet("serviceOnline")]
        [HttpHead("serviceOnline")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult ServiceOnline([FromQuery] string key)
        {
            if (CompareKey(key)) return StatusCode(StatusCodes.Status401Unauthorized, "Bad auth headers");

            return Ok("OK");
        }


        [HttpGet("externalServicesCheck")]
        [HttpHead("externalServicesCheck")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult ExternalServicesCheck([FromQuery] string key)
        {
            if (CompareKey(key)) return StatusCode(StatusCodes.Status401Unauthorized, "Bad auth headers");
            return Ok("OK");
        }



        [HttpGet("folderReadCheck")]
        [HttpHead("folderReadCheck")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult FolderReadCheck([FromQuery] string key)
        {
            if (CompareKey(key)) return StatusCode(StatusCodes.Status401Unauthorized, "Bad auth headers");

            try
            {
                string filePath = "/data/mydata.txt";
                if (!System.IO.File.Exists(filePath))
                {
                    System.IO.File.Create(filePath).Dispose();
                }
                System.IO.File.AppendAllText(filePath, $"Data written at {DateTime.Now}\n");
                string[] lines = System.IO.File.ReadAllLines(filePath);
                return Ok($"Total number of lines: {lines.Length}");
            }
            catch (Exception ex)
            {

                return StatusCode(StatusCodes.Status500InternalServerError, "DB connection: " + ex.Message);
            }
        }

        [HttpGet("dbCheck")]
        [HttpHead("dbCheck")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult DBCheck([FromQuery] string key)
        {
            if (CompareKey(key)) return StatusCode(StatusCodes.Status401Unauthorized, "Bad auth headers");
            try
            {
                _healthService.TestDBConnection();
                return Ok("OK");

            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "DB connection: " + ex.Message);
                 
            }
        }

        [HttpGet("settings")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult GetSettings([FromQuery] string key)
        {
            if (CompareKey(key)) return StatusCode(StatusCodes.Status401Unauthorized, "Bad auth headers");
            var despKeyCloakSettings = PopulateDespSettings();
            return Ok(despKeyCloakSettings);
        }

        private DespKeyCloakSettings PopulateDespSettings()
        {
            DespKeyCloakSettings despKeyCloakSettings = new DespKeyCloakSettings();
            despKeyCloakSettings.ClientSecret = _configuration.GetSection("KEYCLOAK_clientSecret").Value!;
            despKeyCloakSettings.ClientId = _configuration.GetSection("KEYCLOAK_clientId").Value!;
            despKeyCloakSettings.Realm = _configuration.GetSection("KEYCLOAK_realm").Value!;
            despKeyCloakSettings.RealmURL = _configuration.GetSection("KEYCLOAK_realmURL").Value!;
            despKeyCloakSettings.RealmProtocol = _configuration.GetSection("KEYCLOAK_realmProtocol").Value!;
            despKeyCloakSettings.RealmAuth = _configuration.GetSection("KEYCLOAK_realmAuth").Value!;
            despKeyCloakSettings.RealmToken = _configuration.GetSection("KEYCLOAK_realmToken").Value!;

            return despKeyCloakSettings;
        }

        private bool CompareKey(string key)
        {
           string healthToken = _configuration.GetSection("KEYCLOAK_healthtoken").Value!;
           return healthToken != key;           
        }
    }
}
