using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiData.Entities;



namespace Interfaces
{
    public interface IExternalDataService
    {


        Task<List<string>> EndpointToGetDataAsync();

        bool CheckExistingData(string addSettingsWhereToGetData);

        void GetDataFromEndPoint(string addSettingsWhereToGetData);

        void StoreDataPerEndPoint(string addSettingsWhereToGetData);

        void LogEndPointAction(string addSettingsWhereToGetData);
    
    }
}
