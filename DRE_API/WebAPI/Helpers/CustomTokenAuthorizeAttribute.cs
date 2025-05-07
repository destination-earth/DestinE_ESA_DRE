using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using static CSharpFunctionalExtensions.Result;

namespace WebApi.Helpers.Extensions
{
    public class CustomTokenAuthorizeAttribute : Attribute, IAuthorizationFilter
    {

        public void OnAuthorization(AuthorizationFilterContext context)
        {

            // Use dependency injection to get IConfiguration
            var config = context.HttpContext.RequestServices.GetService<IConfiguration>();
            var _expectedToken = config.GetSection("KEYCLOAK_jobtoken").Value!;

            string token = "";
            var request = context.HttpContext.Request;

            string authHeader = request.Headers["Authorization"];

            if (authHeader == null || !authHeader.StartsWith("Bearer "))
            {
                //check for 2nd option.
                var jobToken = request.Headers["X-Job-Token"].FirstOrDefault();
                if (string.IsNullOrEmpty(jobToken) || jobToken.Trim() != _expectedToken)
                {
                    context.Result = new UnauthorizedResult();
                    return;
                }
                token = jobToken.Trim();
            }
            else
            {
                token = authHeader.Substring("Bearer ".Length).Trim();
            }
               
            if (token != _expectedToken)
            {
                context.Result = new ContentResult
                {
                    StatusCode = 401, // Unauthorized status code
                    Content = "Unauthorized", // Custom message
                    ContentType = "text/plain" // Content type
                };
            }
        }
    }
}
