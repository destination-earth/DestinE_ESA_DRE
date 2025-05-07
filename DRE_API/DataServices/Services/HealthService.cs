using System;
using System.Collections.Generic;
using System.Linq;
using WebApiData.Entities;
using WebApiData.Helpers;
using Interfaces;
using DataServices.Models;
using System.Diagnostics.Metrics;
using Microsoft.EntityFrameworkCore;

namespace WebApiData.Services
{

    public class HealthService : IHealthService
    {
        private readonly DataContext _context;

        public HealthService(DataContext context)
        {
            _context = context;
        }

        public string TestDBConnection()
        {
            try
            {
                _context.Database.OpenConnection();
                _context.Database.CloseConnection();
                return "OK";
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }


    }
}
