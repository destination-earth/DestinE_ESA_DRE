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
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text.Json;
using System.Text;



namespace WebApi.Controllers
{
    [Authorize]
    public class SettingsController(IServiceProvider serviceProvider) : BaseController<SettingsController>(serviceProvider)  
    {
        private readonly ISettingsService _sensorDataService = serviceProvider.GetRequiredService<ISettingsService>();
        //private readonly IConfiguration _iConfig;

        [HttpGet("initialize")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<SettingsUI> Initialize([FromQuery] List<string> assetType)
        {
            string userEmail= string.Empty;
       

            //var authHeader = HttpContext.Request.Headers["Authorization"].ToString();

            //if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            //{
            //    return Unauthorized("No valid Bearer token was provided.");
            //}

            //// Remove the "Bearer " prefix to get just the token
            //var token = authHeader.Substring("Bearer ".Length).Trim();
            //string preferredUsername = JwtDecoder.GetPreferredUsername(token);
            //if (preferredUsername == null)
            //{
            //    return Unauthorized("The token does not contain a 'preferred_username' claim.");
            //}
            //else
            //{
            //    userEmail = preferredUsername;
            //}
                Guid userId;

            userId = LoggedUser == null ? new Guid() : LoggedUser.UserId;
            userEmail= LoggedUser == null ? "Anonymous" : LoggedUser.Email;

            var initData = _sensorDataService.Initialize(userId, userEmail);
            return Ok(initData);
        }

    }




    public class JwtDecoder
    {
        public static string GetPreferredUsername(string token)
        {
            // Split the JWT into its parts (header, payload, signature)
            var parts = token.Split('.');
            if (parts.Length < 2)
            {
                throw new ArgumentException("The token does not have the proper JWT format.");
            }

            // The payload is the second part of the JWT.
            var payload = parts[1];

            // Decode the Base64Url-encoded payload
            string jsonPayload = Base64UrlDecode(payload);

            // Parse the JSON payload
            using (JsonDocument document = JsonDocument.Parse(jsonPayload))
            {
                // Check if the "preferred_username" property exists
                if (document.RootElement.TryGetProperty("preferred_username", out JsonElement usernameElement))
                {
                    return usernameElement.GetString();
                }
            }

            // Return null if the property is not found
            return null;
        }

        private static string Base64UrlDecode(string input)
        {
            // Replace URL-safe characters with standard Base64 characters
            string output = input.Replace('-', '+').Replace('_', '/');

            // Add padding if needed
            switch (output.Length % 4)
            {
                case 2: output += "=="; break;
                case 3: output += "="; break;
            }

            // Convert from Base64 string to byte array and then to UTF8 string
            var bytes = Convert.FromBase64String(output);
            return Encoding.UTF8.GetString(bytes);
        }
    }


}
