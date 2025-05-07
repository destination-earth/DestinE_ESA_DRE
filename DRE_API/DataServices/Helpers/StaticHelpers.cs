using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using WebApiData.Entities;

namespace WebApiData.Helpers
{
    public static class DataStaticHelpers
    {

 
        public static string GenerateSmallGuid()
        {
            long ticks = DateTime.UtcNow.Ticks;
            byte[] guidBytes = Guid.NewGuid().ToByteArray();

            byte[] combined = new byte[16];
            Array.Copy(BitConverter.GetBytes(ticks), combined, 8);
            Array.Copy(guidBytes, 0, combined, 8, 8);

            string base64 = Convert.ToBase64String(combined)
                .Replace("+", "")
                .Replace("/", "")
                .Replace("=", "")
                .ToUpper(); // Make all uppercase

            return base64;
        }

 

        public static string GetSetting(IConfiguration configuration, string valueKey)
        {
            var setting = configuration.GetSection(valueKey).Value;
            if (!string.IsNullOrEmpty(setting))
            {
                return setting;
            }

            //To do, use secrets.
            string NoaBaseUrl = "https://hyrefapp.dev.desp.space/solarcore/";
            string NoaInferenceUrl = "https://hyrefapp.dev.desp.space/solar-forecast/";
            string WeMetBasicAssessementUrl = "https://wind-assessment-basic-service.dev.desp.space/assessment/basic";
            string WeMetPremiumAssessementUrl = "https://wind-assessment-premium-service.dev.desp.space/assessment/premium";

            string WeMetBasicForecastUrl = "https://wind-forecast-service.dev.desp.space/wind/forecast";
            string WeMetPremiumForecastUrl = "https://wind-forecast-service.dev.desp.space/wind/forecast";

            string SolarUploadAssessment = "/dredata/solar/assessment/uploaded/";
            string SolarUploadForecast = "/dredata/solar/uploaded/";
            string SolarUploadForecastStored = "/app/data/";
            string WindUploadAssessment = "/dredata/wind/assessment/uploaded/";
            string WindUploadForecast = "/dredata/wind/forecast/uploaded/";

            string SolarModelOutputPath = "./models/";

            string NoaSolarValidate = "https://hyrefapp.dev.desp.space/solarcore/validate-csv/";

            string NoaSolarAssessmentBasicUrl = "https://hyrefapp.dev.desp.space/solar-basic-assessment-service/";
            string NoaSolarAssessmentPremiumUrl = "https://hyrefapp.dev.desp.space/solar-assessment-premium-service";

            string NoaSolarForecastOnlyParkSpecs = "https://hyrefapp.dev.desp.space/solar-forecast-one-off-service-park-specifications";


            return valueKey switch
            {
                "NoaBaseUrl" => NoaBaseUrl,
                "NoaInferenceUrl" => NoaInferenceUrl,
                "WeMetBasicAssessementUrl" => WeMetBasicAssessementUrl,
                "WeMetPremiumAssessementUrl" => WeMetPremiumAssessementUrl,
                "SolarUploadForecast" => SolarUploadForecast,
                "WindUploadAssessment" => WindUploadAssessment,
                "WindUploadForecast" => WindUploadForecast,
                "WeMetBasicForecastUrl" => WeMetBasicForecastUrl,
                "WeMetPremiumForecastUrl" => WeMetPremiumForecastUrl,   
                "NoaSolarValidate" => NoaSolarValidate,
                "NoaSolarAssessmentBasicUrl" => NoaSolarAssessmentBasicUrl,
                "NoaSolarAssessmentPremiumUrl" => NoaSolarAssessmentPremiumUrl,
                "SolarModelOutputPath" => SolarModelOutputPath,
                "NoaSolarForecastOnlyParkSpecs" => NoaSolarForecastOnlyParkSpecs,
                "SolarUploadAssessment" => SolarUploadAssessment,
                "SolarUploadForecastStored" => SolarUploadForecastStored,
                _ => throw new ArgumentException($"Unknown service name: {valueKey}")
            };
        }
        public static string FixEmail(string email)
        {  
            string fixedEmail = email.Replace("@","_").Replace(".","_");

            return fixedEmail;
        }






        /// <summary>
        /// 
        /// </summary>
        /// <param name="path">The main path to store based on NFS</param>
        /// <param name="user">The user email, the dots, at will be replaced</param>
        /// <param name="guid">The guid generated when storing the job</param>
        /// <param name="energySource">solar or wind</param>
        /// <param name="plan">basic or premium</param>
        /// <param name="type">forecast or assessment</param>
        /// <returns></returns>
        public static string CreateFilePath(string path,string user, string guid, string energySource,string plan, string type)
        {
            string fixedEmail = FixEmail(user);
            string filePath = path + plan + "/"+ fixedEmail + "/" + guid;
            return filePath;
        }

    }


    public static class JobsTypesFilters
    {
        public const string forecast = "forecast";
        public const string assessment = "assessment";
        public const string solar = "solar";
        public const string wind = "wind";
        public const string premium = "premium";
        public const string basic = "basic";
        public const string pending = "pending";
        public const string inprogress = "inprogress";
        public const string finished = "finished";
        public const string failed = "failed";
        public const string completed = "completed";
        public const string powercurve = "power_curve";
        public const string traindata = "train_data";
    }

}
