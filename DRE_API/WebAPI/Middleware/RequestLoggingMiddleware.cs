using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebApiData.Helpers;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using OpenIddict.Abstractions;
using System.Security.Claims;

namespace WebApi.Middleware
{

    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly string _logDirectory;
        private readonly ILogger<RequestLoggingMiddleware> _logger;
        private IConfiguration _configuration;

        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger, IServiceScopeFactory scopeFactory)
        {
            _next = next;
            _logger = logger;
            
            using var scope = scopeFactory.CreateScope();
            _configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
            _logDirectory = _configuration.GetSection("HYREFAPP_logpath").Value!; //; "/data/logs";
            Directory.CreateDirectory(_logDirectory);
        }
         
        public async Task Invoke(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();
            context.Request.EnableBuffering();

            string requestId = context.TraceIdentifier;

            var requestTimeUtc = DateTime.UtcNow;

            // Let request proceed
            var originalBodyStream = context.Response.Body;
            await using var newBodyStream = new MemoryStream();
            context.Response.Body = newBodyStream;

            await _next(context);

            stopwatch.Stop();
            var responseTimeUtc = DateTime.UtcNow;
            var requestDurationMs = stopwatch.ElapsedMilliseconds;

            string userId = "";


            if (!(context.User == null || !(context.User.Identity?.IsAuthenticated ?? false)))
            {
                userId = context.User.GetClaim(ClaimTypes.Email) ?? context.User.GetClaim(OpenIddictConstants.Claims.Email) ?? context.User.GetClaim("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier");
            }
             if (userId == null || userId == string.Empty)
            {
                userId = "anonymous";
            }

                // Create log object
            var logObject = new Dictionary<string, object>
            {
                ["@timestamp"] = responseTimeUtc.ToString("o"),
                ["event_type"] = "user_data_request",
                ["service_name"] = "destine-service-hyrefapp",
                ["event_timestamp"] = requestTimeUtc.ToString("o"),
                ["request_id"] = requestId,
                ["user_id"] = userId,
                ["method"] = context.Request.Method,
                ["request_path"] = context.Request.Path,
                ["url"] = $"{context.Request.Scheme}://{context.Request.Host}{context.Request.Path}{context.Request.QueryString}",
                ["source"] = "react_web_app",
                ["datastream_id"] = context.Connection.Id.ToString(),
                ["datastream_name"] = "real-time-metrics",
                ["response_code"] = context.Response.StatusCode,
                ["request_time"] = requestDurationMs,
                ["level"] = "INFO",
                ["message"] = context.Response.StatusCode == 200 ? "Request successfully processed": "Error processing request."
            };

            string json = JsonSerializer.Serialize(logObject) + Environment.NewLine;
            string logFile = Path.Combine(_logDirectory, $"requests-{requestTimeUtc:yyyy-MM-dd}.json");

            await File.AppendAllTextAsync(logFile, json);

            // Reset body stream
            newBodyStream.Position = 0;
            await newBodyStream.CopyToAsync(originalBodyStream);
            context.Response.Body = originalBodyStream;
        }
    }

}