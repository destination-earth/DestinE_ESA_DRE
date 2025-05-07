using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using WebApiData.Entities;
using static CSharpFunctionalExtensions.Result;
using WebApiData.Helpers;

namespace WebApi.Helpers
{
    public static class StaticGlobalHelpers
    {

        static public int AccountId(IConfiguration iConfig)
        {
            int accountId;
            accountId = int.Parse(iConfig.GetSection("variousSettings").GetSection("testUserId").Value);
            return accountId;

        }

        public static double ReduceDecimals(double? value, int decimals)
        {
            return Math.Round(value ?? 0, decimals);
        }

        public static string GetSetting(IConfiguration configuration, string valueKey)
        {
            return DataStaticHelpers.GetSetting(configuration, valueKey);
        }
    }




    

}
