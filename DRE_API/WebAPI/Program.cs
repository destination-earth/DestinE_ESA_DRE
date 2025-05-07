using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using WebApiData.Helpers;


namespace WebApi
{
    public static class Program
    {
        public static void Main(string[] args) =>
            CreateHostBuilder(args).Build().Run();

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((hostingContext, config) =>
                {
                    config.AddEnvironmentVariables("HRF_");
                    config.AddJsonFile("appsettings.json", true, true);
                    config.AddJsonFile($"appsettings.{hostingContext.HostingEnvironment.EnvironmentName}.json",
                        true, true);
                }).ConfigureLogging(logging =>
                {
                    logging.AddConsole();
                })



                .ConfigureWebHostDefaults(builder =>
                {
                     
                    builder.ConfigureKestrel(kso =>
                    {
                        kso.AddServerHeader = false;
                        kso.Limits.MaxRequestBodySize = 10 * 1024 * 10024;
                    });
                    builder.UseStartup<Startup>();
                });
    }
}
