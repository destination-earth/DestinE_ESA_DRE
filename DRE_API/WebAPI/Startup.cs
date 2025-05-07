using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using WebApi.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Extensions.Logging;
using NSwag.Generation.Processors.Security;
using NSwag;
using System.IO.Compression;
using System.Text.Json.Serialization;
using System.Text.Json;
using Microsoft.Extensions.Hosting;
using NSwag.AspNetCore;
using System.IO;
using WebApiData.Helpers;
using Microsoft.AspNetCore.Http;
using Aspnet.Helpers;
using Interfaces;
using WebApiData.Services;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.AspNetCore.Mvc.NewtonsoftJson;
using Microsoft.AspNetCore.Http.Features;
using System.IdentityModel.Tokens.Jwt;
using WebApi.Middleware;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Antiforgery;


namespace WebApi
{


    public class Startup
    {
        private IWebHostEnvironment Environment { get; }
        private IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            Configuration = configuration;
            Environment = environment;
        }
 
        public void ConfigureServices(IServiceCollection services)
        {
             
            services.AddControllers()
                .AddJsonOptions(x =>
                {
                    x.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                    x.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                    x.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
                    x.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;

                });

            /*  services.AddMvc()
                .AddNewtonsoftJson(options =>
                options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
                );
            */

            services.AddEndpointsApiExplorer();
            services.AddCors(setup =>
            {
                setup.AddDefaultPolicy(policy =>
                {
                    policy.WithExposedHeaders("X-Pagination").WithExposedHeaders("Content-Disposition")
                        .WithExposedHeaders("X-Sensors")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowAnyOrigin();
                });
            });
            services.AddResponseCompression(options =>
            {
                options.EnableForHttps = true;
                options.Providers.Add<BrotliCompressionProvider>();
                options.Providers.Add<GzipCompressionProvider>();
            });

            services.Configure<BrotliCompressionProviderOptions>(options => { options.Level = CompressionLevel.Fastest; });

            services.Configure<GzipCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.SmallestSize;
            });
            services.AddHttpContextAccessor();

            services.AddSingleton<IAuthorizationHandler, RequireScopeHandler>();
            services.AddLogging(x => { x.AddConsole(); });
            services.AddHttpLogging(x => { x.CombineLogs = true; });
 

            services.AddOpenApiDocument(document =>
            {
                document.PostProcess = doc =>
                {
                    doc.Info.Version = "1.0";
                    document.Title = "HYREF.API";
                    document.Version = "v1";
                    document.Description = "The HTTP API for HYREF's platform integration";
                };
                document.DocumentName = "1.0";

              

                document.SchemaSettings.AlwaysAllowAdditionalObjectProperties = false;
                document.RequireParametersWithoutDefault = false;
                document.SchemaSettings.IgnoreObsoleteProperties = true;

                document.Title = "HYREF.API";
                document.Version = "v1";
                document.Description = "The HTTP API for HYREF's platform integration";

                var authUrl = new UriBuilder(DataStaticHelpers.GetSetting(Configuration,"KEYCLOAK_realmProtocol"));
                authUrl.Path = "connect/authorize";
                var tokenUrl = new UriBuilder(DataStaticHelpers.GetSetting(Configuration,"KEYCLOAK_realmProtocol"));
                tokenUrl.Path = "connect/token";


                document.DocumentProcessors.Add(
                    new SecurityDefinitionAppender("HYREFToken", new OpenApiSecurityScheme
                    {
                        Flows = new OpenApiOAuthFlows
                        {
                            AuthorizationCode = new OpenApiOAuthFlow
                            {
                                AuthorizationUrl = authUrl.Uri.ToString(),
                                TokenUrl = tokenUrl.Uri.ToString(),
                                Scopes = new Dictionary<string, string>
                                {
                                { "openid", "openid" }, { "profile", "profile" }, { "email", "email" },
                                { "hyref_api", "hyref_api" }
                                },
                            },
                            ClientCredentials = new OpenApiOAuthFlow
                            {
                                TokenUrl = tokenUrl.Uri.ToString(),
                                Scopes = new Dictionary<string, string>
                                {
                                { "openid", "openid" }, { "profile", "profile" }, { "email", "email" },
                                { "hyref_api", "hyref_api" }
                                },
                                // AuthorizationUrl = authUrl.Uri.ToString()
                            },
                        },
                        Type = OpenApiSecuritySchemeType.OAuth2,
                        Description = "HYREF JWT Token",
                    })
                );
                document.OperationProcessors.Add(new OperationSecurityScopeProcessor("HYREFToken"));
            });


            services.AddAuthentication(options =>
            {
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.Authority = DataStaticHelpers.GetSetting(Configuration,"KEYCLOAK_realmURL");
                options.RequireHttpsMetadata = Environment.IsProduction();
                options.Audience = DataStaticHelpers.GetSetting(Configuration,"KEYCLOAK_clientId");

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidIssuer = DataStaticHelpers.GetSetting(Configuration,"KEYCLOAK_realmURL"),
                    ValidAudiences = new[] { DataStaticHelpers.GetSetting(Configuration,"KEYCLOAK_clientId") },
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                };


                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        Console.WriteLine($"[AUTH ERROR] {context.Exception.GetType().Name}: {context.Exception.Message}");

                        // Optional: Add custom header if token is expired
                        if (context.Exception is SecurityTokenExpiredException)
                        {
                            context.Response.Headers.Append("Token-Expired", "true");
                        }

                        context.NoResult(); // Prevents default behavior
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                        context.Response.ContentType = "application/json";

                        var errorJson = JsonSerializer.Serialize(new
                        {
                            error = "Authentication failed",
                            detail = context.Exception.Message
                        });

                        return context.Response.WriteAsync(errorJson);
                    },
                    OnChallenge = context =>
                    {
                        Console.WriteLine($"[AUTH CHALLENGE] {context.Error}: {context.ErrorDescription}");
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        Console.WriteLine("[AUTH SUCCESS] Token validated successfully");
                        return Task.CompletedTask;
                    }
                };


 
            });





            // adds an authorization policy to make sure the token is for scope 'hyref_api'
            services.AddAuthorization(options =>
            {
                options.AddPolicy("ApiScope", policy =>
                {
                    policy.RequireAuthenticatedUser();
                    policy.Requirements.Add(new RequireScope("hyref_api"));
                });
            });
            services.AddScoped<ILoggedUser>(x => LoggedUser.Create(x.GetService<IHttpContextAccessor>()!)!);
            //services.AddInfrastructure(Configuration);


            //This is only for testing.
           services.AddDbContext<DataContext>(options =>
            {
                DataContext.Create(options, DataStaticHelpers.GetSetting(Configuration,"dbConnection")!);
            });

            services.AddDbContext<DataContext>(options =>
                options.UseNpgsql(DataStaticHelpers.GetSetting(Configuration,"dbConnection")));


            services.AddDbContext<DataContext>(options =>
            {
                
            });

 

            services.AddDbContext<DataContext>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<ISensorDataService, SensorDataService>();
            services.AddScoped<ISettingsService, SettingsService>();
            services.AddScoped<IDESPKeyCloakService, DESPKeyCloakService>();
            services.AddScoped<IPlantService, PlantService>();
            services.AddScoped<IHealthService, HealthService>();
            services.AddScoped<IJobService, JobService>();
            services.AddScoped<IAssessmentService, AssessmentService>();
            services.AddScoped<IForecastService, ForecastService>();
            services.AddScoped<IUploadedDataService, UploadedDataService>();
            services.AddScoped<IExternalHttpService, ExternalHttpService>();

            //services.AddAntiforgery(options =>
            //{
            //    options.HeaderName = "X-XSRF-TOKEN";
            //});


        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseResponseCompression();
            app.UseCors(x => x.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader().WithExposedHeaders("X-Pagination").WithExposedHeaders("Content-Disposition")
                .WithExposedHeaders("X-Sensors"));

            if (!Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            else
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseStatusCodePagesWithReExecute("/error");

            // Add web UIs to interact with the document
            app.UseOpenApi(_ => { });
            app.UseSwaggerUi(options =>
            {
                options.DefaultModelsExpandDepth = 3;
                options.DefaultModelExpandDepth = 3;
                options.DocExpansion = "list";


                // Define web UI route
                options.Path = "/api-doc";
                options.PersistAuthorization = true;
                options.CustomStylesheetPath = "/swagger/swagger.css";
                options.OAuth2Client = new OAuth2ClientSettings()
                {
                    ClientId = "hyref_swagger",
                    AppName = "HYREF.API-Swagger",
                    ClientSecret = DataStaticHelpers.GetSetting(Configuration,"KEYCLOAK_clientSecret"),
                    UsePkceWithAuthorizationCodeGrant = true,
                    Scopes = { "openid", "profile", "email", "hyref_api" }
                };
            });


            app.UseStaticFiles(); // Serve static files (including SPA files)

            app.UseMiddleware<RequestLoggingMiddleware>();
            app.UseMiddleware<ErrorHandlerMiddleware>();  

            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();


            //app.Use(async (context, next) =>
            //{
            //    if (HttpMethods.IsPost(context.Request.Method))
            //    {
            //        var antiforgery = context.RequestServices.GetRequiredService<IAntiforgery>();
            //        await antiforgery.ValidateRequestAsync(context);
            //    }

            //    await next();
            //});


            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                // endpoints.MapFallbackToFile("index.html"); // this doesn't work, all redirects go to index?
            });


            // If using React or another SPA framework
            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "app"; // Path to the SPA files
            });

            // Configure middleware to handle client-side routing fallback
            app.Use(async (context, next) =>
            {
                await next();

                // If the requested resource is a file or an API endpoint, do not serve index.html
                if (context.Response.StatusCode == 404 && !Path.HasExtension(context.Request.Path.Value))
                {
                    context.Request.Path = "/index.html"; // Serve index.html for all non-file requests
                    await next();
                }
            });


        }

        private void TestSettings()
        {
            Console.WriteLine("clientSecret " + DataStaticHelpers.GetSetting(Configuration,"KEYCLOAK_clientSecret"));
            Console.WriteLine("clientId "+DataStaticHelpers.GetSetting(Configuration,"KEYCLOAK_clientId"));
            Console.WriteLine("realmURL" + DataStaticHelpers.GetSetting(Configuration,"KEYCLOAK_realmProtocol"));
            Console.WriteLine("realmURL" + DataStaticHelpers.GetSetting(Configuration,"KEYCLOAK_realmURL"));
            Console.WriteLine("dbConnection " + DataStaticHelpers.GetSetting(Configuration,"dbConnection"));

        }
        private string GetSetting(string key)
        {

            var setting = Configuration.GetSection(key).Value;
            if (string.IsNullOrEmpty(setting))
            {
                setting = Configuration.GetConnectionString(key);
            }

            return setting;
        }

    }
}