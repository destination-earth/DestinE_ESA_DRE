using DataServices.Models;
using System;
using System.Collections.Generic;
using WebApiData.Entities;



namespace Interfaces
{
    public interface ISensorDataService
    {
        List<MeterologicalData> GetSolarMeteorologicalData(string keyType, string plantKey);
        List<SolarDataResponseRecords> GetSolarProductionDustData(string keyType, string plantKey);
        List<SolarDataResponseRecords> GetSolarPredictionDustData(string keyType, string plantKey);





        void StoreSolarProductionDustData(UploadSettings uploadSettings, List<SolarProductionDustRecord> records);
        SolarDataResponse SolarEnergyProductionData(int accountId, int assetId, DateTime fromDate, DateTime toDate);
        WindDataResponse WindEnergyProductionData(int accountId, int assetId, DateTime fromDate, DateTime toDate);
        HybridDataResponse HybridEnergyProductionData(int accountId, int combinationId, DateTime fromDate, DateTime toDate);
    }
}
