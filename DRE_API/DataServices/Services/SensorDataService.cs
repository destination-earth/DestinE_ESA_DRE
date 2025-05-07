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

    public class SensorDataService: ISensorDataService
    {
        private readonly DataContext _context;

        public SensorDataService(DataContext context)
        {
            _context = context;
        }


        public void StoreSolarProductionDustData(UploadSettings uploadSettings, List<SolarProductionDustRecord> records)
        {
            List<LiveMeasurements > measurements = new List< LiveMeasurements >();
            //find internal plantid from key, 

            var plant = _context.Plant.FirstOrDefault(p => p.Descriptor == uploadSettings.PlantKey);

            string keyType = uploadSettings.KeyType;

            int plantId = plant.Id;

            foreach (var record in records)
            {

                var dataTimeStamp = DateTime.SpecifyKind(record.Timestamp, DateTimeKind.Utc);
                var platformTimeStamp = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);


                var measurement = new LiveMeasurements()
                {
                    PlantId= plantId,
                    DataTimeStamp = dataTimeStamp,
                    PlatformTimeStamp = platformTimeStamp,
                    SensorId = 1,
                    //Plant = new Plant() { Id=1},
                    SensorValue = (decimal)record.Ghi,
                    KeyType = keyType

                };
                measurements.Add(measurement);

              measurement = new LiveMeasurements()
                {
                   PlantId = plantId,
                   DataTimeStamp = dataTimeStamp,
                   PlatformTimeStamp = platformTimeStamp,
                   SensorId = 2,
                   SensorValue = (decimal)record.GhiCorrected,
                   KeyType = keyType
              };
                measurements.Add(measurement);

                measurement = new LiveMeasurements()
                {
                    PlantId = plantId,
                    DataTimeStamp = dataTimeStamp,
                    PlatformTimeStamp = platformTimeStamp,
                    SensorId = 3,
                    SensorValue = (decimal)record.Aot,
                    KeyType = keyType
                };
                measurements.Add(measurement);

                measurement = new LiveMeasurements()
                {
                    PlantId = plantId,
                    DataTimeStamp = dataTimeStamp,
                    PlatformTimeStamp = platformTimeStamp,
                    SensorId = 4,
                    SensorValue = (decimal)record.Production,
                    KeyType = keyType
                };
                measurements.Add(measurement);

                measurement = new LiveMeasurements()
                {
                    PlantId = plantId,
                    DataTimeStamp = dataTimeStamp,
                    PlatformTimeStamp = platformTimeStamp,
                    SensorId = 5,
                    SensorValue = (decimal)record.ProductionCorrected,
                    KeyType = keyType
                };
                measurements.Add(measurement);

                measurement = new LiveMeasurements()
                {
                    PlantId = plantId,
                    DataTimeStamp = dataTimeStamp,
                    PlatformTimeStamp = platformTimeStamp,
                    SensorId = 6,
                    SensorValue = (decimal)record.ReductionPercentage,
                    KeyType = keyType
                };
                measurements.Add(measurement);
            }



            try
            {
                _context.LiveMeasurements.AddRangeAsync(measurements);
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw ex;
            }
           

        }




        public List<SolarDataResponseRecords> GetSolarProductionDustData(string keyType,string plantKey)
        {
           var solas = _context.LiveMeasurements.Select(m => new SolarDataResponseRecords ()
                      { 
                            
           
                      }).ToList();


            List<SolarDataResponseRecords> solarDataResponseRecords = new List<SolarDataResponseRecords>();
            return solarDataResponseRecords;
        }


        public List<SolarDataResponseRecords> GetSolarPredictionDustData(string keyType, string plantKey)
        {
            List<SolarDataResponseRecords> solarDataResponseRecords = new List<SolarDataResponseRecords>();
            return solarDataResponseRecords;
        }

        public List<MeterologicalData> GetSolarMeteorologicalData(string keyType, string plantKey)
        {
            List<MeterologicalData> solarDataResponseRecords = new List<MeterologicalData>();
            return solarDataResponseRecords;
        }















        public SolarDataResponse SolarEnergyProductionData(int accountId, int assetId, DateTime fromDate, DateTime toDate)
        {
            var measurements = _context.SolarEnergyProduction.ToList();     
              SolarDataResponse solarDataResponse = new SolarDataResponse();
            return solarDataResponse;
        }

        public WindDataResponse WindEnergyProductionData(int accountId, int assetId, DateTime fromDate, DateTime toDate)
        {
            var measurements = _context.WindEnergyProduction.ToList();
            WindDataResponse windDataResponse = new WindDataResponse(); 
            return windDataResponse;
        }


        public HybridDataResponse HybridEnergyProductionData(int accountId, int assetId, DateTime fromDate, DateTime toDate)
        {
            var measurements = _context.WindEnergyProduction.ToList();
            HybridDataResponse hybridDataResponse = new HybridDataResponse();   
            return hybridDataResponse;
        }


    }
}
