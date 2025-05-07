using System;
using System.Collections.Generic;
using System.Linq;
using WebApiData.Entities;
using WebApiData.Helpers;
using Interfaces;
using DataServices.Models;
using Microsoft.AspNetCore.Mvc;

namespace WebApiData.Services
{

    public class ForecastService : IForecastService
    {
        private readonly DataContext _context;

        public ForecastService(DataContext context)
        {
            _context = context;
        }

        public string Initialize(string asset, DateTime startDate, DateTime endDate)
        {
            throw new NotImplementedException();
        }
    }
}
