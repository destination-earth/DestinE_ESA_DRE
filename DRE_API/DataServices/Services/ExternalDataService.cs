using System;
using System.Collections.Generic;
using System.Linq;
using WebApiData.Entities;
using WebApiData.Helpers;
using Interfaces;
using DataHelpers = DataServices.Helpers;
using System.Net.Http;
using System.Threading.Tasks;
using DataServices.Models;
using System.Collections;

namespace WebApiData.Services
{
    /*
     So the idea is this:
    From DB I get the endpoints, settings
    I get the last retrieval data per endpoint (success, fail, data etc, date from, date To)

    There are X types of data.
    A generic one, were schemas are set by ENORA and the other end needs to adhere (same schema etc)
    OR
    Custom, new method per endpoint.

    So I loop through the each point, select the proper method end invoke service.

     
     
     
     */

    /// <summary>
    /// This class manages data from external vendors
    /// </summary>
    public class ExternalDataService : IExternalDataService
    {
        private readonly DataContext _context;

        public ExternalDataService(DataContext context)
        {
            _context = context;
        }


        public async Task<List<string>> EndpointToGetDataAsync()
        {
           /* HttpClient httpClient = new HttpClient();   

            DataHelpers.ExtHttpService extHttpService = new DataHelpers.ExtHttpService(httpClient);

            var url = "https://api.example.com/data";

            await extHttpService.GetAsync<EndpointSetting>("");*//* HttpClient httpClient = new HttpClient();   

            DataHelpers.ExtHttpService extHttpService = new DataHelpers.ExtHttpService(httpClient);

            var url = "https://api.example.com/data";

            await extHttpService.GetAsync<EndpointSetting>("");*/

            List<string> endpoints = new List<string>();    

            return endpoints;
        }


        public bool CheckExistingData(string addSettingsWhereToGetData)
        {
            return false;
        }

        public void GetDataFromEndPoint(string addSettingsWhereToGetData)
        {

        }

        public void StoreDataPerEndPoint(string addSettingsWhereToGetData)
        {

        }

        public void LogEndPointAction(string addSettingsWhereToGetData)
        {

        }


    }
}
