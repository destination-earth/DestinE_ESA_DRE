using DataServices.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net;
using WebApiData.Entities;

namespace Interfaces
{
    public interface IAssessmentService
    {    
        string Initialize(string asset, DateTime startDate, DateTime endDate);

        SolarBasicResponse AboutSolar();
        SolarBasicResponse SolarBasic(SolarBasicRequest request);
        SolarPremiumResponse SolarPremium(SolarPremiumRequest request);


        WindBasicResponse AboutWind();
        WindBasicResponse WindBasic(WindBasicRequest request, string jobKey);
        WindPremiumResponse WindPremium(WindPremiumRequest request, string jobKey);
        WindPremiumResponse WindPremiumWithFile(IFormFile file, WindPremiumRequest request, string jobKey); //May change this to string instead of file!
    }
}
