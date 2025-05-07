using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using WebApiData.Entities;
using DataServices.Models;
using Newtonsoft.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore.Query.SqlExpressions;
using System.Linq;
using System.Globalization;
using static Org.BouncyCastle.Bcpg.Attr.ImageAttrib;
using WebApi.Helpers;
using System.Threading.Tasks;
using System.Runtime.Serialization;


namespace WebApi.Controllers
{
    [Authorize]
    public class SensorDataController(IServiceProvider serviceProvider) : BaseController<SensorDataController>(serviceProvider)  
    {
        private readonly ISensorDataService _sensorDataService = serviceProvider.GetRequiredService<ISensorDataService>();
        //private readonly IConfiguration _iConfig;


        #region Solar Production for DEMO

        [HttpGet("solarproductiondemo")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<SolarDataResponse> SolarEnergyProduction([FromQuery] string asset, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
          
            var uu = this.LoggedUser;

            SolarDataResponse solarDataResponse = new SolarDataResponse();
            solarDataResponse.PredictionRecords = MockData.GetSolarDataDemoTop();
            solarDataResponse.ProductionRecords = MockData.GetSolarDataDemoTable();
            solarDataResponse.MeterologicalData = MockData.GetSolarDemoMeteoData();


            solarDataResponse.KpisData = new List<LabelValueDetails> {
            new LabelValueDetails(){Id=1, Label="Availability", Value="100%",Details="Availability is the percentage of the time the PV plant operated during sunlight hours." },
            new LabelValueDetails(){Id=2, Label="Performance Ratio (PR)", Value="52.3%",Details=" The PR indicates how efficiently the solar plant operates relative to its theoretical potential." },
            new LabelValueDetails(){Id=3, Label="Efficiency", Value="16.7%",Details="Efficiency reflects how effectively solar energy is converted into electrical energy. " },};
            return Ok(solarDataResponse);
        }

        #endregion



        //Solar Production WITH DUST
        [HttpGet("solarproductiondustdemo")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<SolarDataResponseDust> SolarEnergyProductionWithDust([FromQuery] string asset, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {


            var what_if_small_aod_with_production = MockData.GetData("what_if_small_aod_with_production");
            var what_if_medium_aod_with_production = MockData.GetData("what_if_medium_aod_with_production");
            var what_if_high_aod_with_production = MockData.GetData("what_if_high_aod_with_production");


            SolarDataResponseDust solarDataResponse = new SolarDataResponseDust();
            solarDataResponse.solarDustAOT = MockData.GetSolarDustAOTs();
            solarDataResponse.solarDustPercentage = MockData.GetSolarDustPercentage();
            //solarDataResponse.solarDustTable = GetSolarDustTable();
            
            solarDataResponse.solarDustTableSmall = MockData.GetSolarDustTable(what_if_small_aod_with_production);
            solarDataResponse.solarDustTableMedium = MockData.GetSolarDustTable(what_if_medium_aod_with_production);
            solarDataResponse.solarDustTableHigh = MockData.GetSolarDustTable(what_if_high_aod_with_production);
            return Ok(solarDataResponse);
        }






        [HttpGet("winddemo")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<WindDataResponse>> WindDemoData([FromQuery] string asset, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var test = await MockData.GetWindDataDemoRemote();

           // var windDataResponse = MockData.GetWindDataDemo();
            return Ok(test);
       
        }


        [HttpGet("hybriddemo")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<HybridDataResponse>> HybridDemoData([FromQuery] string asset, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {

            var hybridDataResponse = await MockData.GetHybridDataDemoRemote();  
            //var hybridDataResponse  = MockData.GetHybridDataDemo();
            return Ok(hybridDataResponse);
         
        }




        #region Wind / Hybrid

        [HttpGet("windproduction")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<WindDataResponse> WindEnergyProduction(
            [FromQuery] string asset,
            [FromQuery] string includes,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var tim = DateTime.Now;
            var s = _sensorDataService.WindEnergyProductionData(0, 0, startDate, endDate);
            return Ok(s);
        }



        [HttpGet("hybridproduction")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public ActionResult<HybridDataResponse> HybridEnergyProduction(
            [FromQuery] string asset,
            [FromQuery] string includes,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            var tim = DateTime.Now;
            var s = _sensorDataService.WindEnergyProductionData(0, 0, startDate, endDate);
            return Ok(s);
        }

        #endregion


    }

    #region Classes for return

    class SolarData
    {
        [JsonProperty("time_utc")]
        public string TimeUtc { get; set; }

        [JsonProperty("Solar_Power_Production_kW")]
        public double SolarPowerProductionKW { get; set; }

        [JsonProperty("GHI_kWhm-2")]
        public double GhiKWhM2 { get; set; }

        [JsonProperty("Amb_Temp_C")]
        public double AmbTempC { get; set; }
    }

    public class WindData
    {
        [JsonProperty("time_utc")]
        public string time_utc { get; set; }
        public double Wind_Power_Production_kW { get; set; }

        [JsonProperty("Wind_Speed_ms-1")]
        public double Wind_Speed_ms1 { get; set; }
        public double Wind_Dir_deg { get; set; }
      
    }

    public class SolarDustData
    {
        public int order { get; set; }
        public string timestamps { get; set; }
        public double ghi { get; set; }
        public double ghi_corrected { get; set; }
        public double aot { get; set; }
        public double production { get; set; }
        public double production_corrected { get; set; }

        [JsonProperty("reduction_%")]
        public double reduction_ { get; set; }
    }

    public class WindDataA
    {
        [JsonProperty("#DateTime")]
        public object DateTime { get; set; }

        [JsonProperty("Power(kw)")]
        public double Powerkw { get; set; }

        [JsonProperty("Wind_Speed(m/s)")]
        public double Wind_Speedms { get; set; }

        [JsonProperty("Wind_Direction(deg)")]
        public double Wind_Directiondeg { get; set; }
    }

    public class WindDataB
    {
        [JsonProperty("#DateTime")]
        public object DateTime { get; set; }

        [JsonProperty("Power(kw)")]
        public double Powerkw { get; set; }

        [JsonProperty("Wind_Speed(m/s)")]
        public double Wind_Speedms { get; set; }

        [JsonProperty("Wind_Direction(deg)")]
        public double Wind_Directiondeg { get; set; }

        [JsonProperty("Perc_Rated(%)")]
        public int Perc_Rated { get; set; }
    }

    public class WindDataC
    {
        [JsonProperty("#DateTime Power(kw)")]
        public object DateTimePowerkw { get; set; }

        [JsonProperty("Wind_Speed(m/s)")]
        public double Wind_Speedms { get; set; }

        [JsonProperty("Wind_Direction(deg)")]
        public double Wind_Directiondeg { get; set; }

        [JsonProperty("Perc_Rated(%)")]
        public double Perc_Rated { get; set; }

        [JsonProperty("Empirical_Corresp(kw)")]
        public int Empirical_Correspkw { get; set; }

        [JsonProperty("Boundaries(Y/N)")]
        public double BoundariesYN { get; set; }
    }

    public class SimpleSolarX
    {
        public DateTime Timestamp { get; set; }
        public double PowerKw { get; set; }
        public string AmbientTemperature { get; set; }
        public double SolarIrradiation { get; set; }
    }

    [DataContract]
    public class SimpleSolar
    {
        [DataMember]
        public string timestamp { get; set; }
        [DataMember]
        public double powerKw { get; set; }

        [DataMember]
        public double ambientTemperature { get; set; }
        [DataMember]
        public double solarIrradiation { get; set; }
    }

    public class InaccessDto
    {
        public string date { get; set; }
        public string uri { get; set; }
        public string val { get; set; }
        public string quality { get; set; }
        public string measurementSourceId { get; set; }
        public object groupEventId { get; set; }
        public object multiValues { get; set; }
        public string reception { get; set; }
    }
    #endregion

}
