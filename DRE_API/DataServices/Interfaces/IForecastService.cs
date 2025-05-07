using DataServices.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Net;
using WebApiData.Entities;

namespace Interfaces
{
    public interface IForecastService
    {    
        string Initialize(string asset, DateTime startDate, DateTime endDate);
    }
}
