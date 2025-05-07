using DataServices.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApiData.Entities;

namespace Interfaces
{
    public interface IUploadedDataService
    {
        Task SaveUploadedDataBatchAsync(IEnumerable<UploadedData> dataBatch);
        Task StoreWindRose(List<WindRose> windRose);
        Task StoreWindDirectional(List<WindDirectional> windDirectional);
    }
}
