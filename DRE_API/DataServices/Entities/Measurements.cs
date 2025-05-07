using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApiData.Entities
{

    /// <summary>
    ///  Holds all the measurments for solar PRODUCTION
    /// </summary>
    [Table("live_measurements", Schema = "data")]
    public partial class LiveMeasurements
    {
        [Column("plant_id")]
        public int PlantId { get; set; }

        [Column("sensor_id")]
        public int SensorId { get; set; }

        [Column("sensor_value")]
        public decimal SensorValue { get; set; }

        [Column("data_time_stamp")]
        public DateTime DataTimeStamp { get; set; }

        [Column("paltform_time_stamp")]
        public DateTime PlatformTimeStamp { get; set; }

        [Column("key_type ")]
        public string KeyType { get; set; }

        //public Plant Plant { get; set; }
    }


    /// <summary>
    ///  Holds all the measurments for solar PRODUCTION
    /// </summary>
    [Table("predictions", Schema = "data")]
    public partial class Predictions
    {
        [Column("plant_id")]
        public int PlantId { get; set; }

        [Column("sensor_id")]
        public int SensorId { get; set; }

        [Column("sensor_value")]
        public decimal SensorValue { get; set; }

        [Column("data_time_stamp ")]
        public DateTime DataTimeStamp { get; set; }

        public Plant Plant { get; set; }
    }





    /// <summary>
    ///  Holds all the measurments for solar PRODUCTION
    /// </summary>
    [Table("solar_energy_production", Schema = "data")]
    public partial class SolarEnergyProduction
    {
        [Column("plant_id")]
        public int PlantId { get; set; }

        [Column("power_kw")]
        public decimal Power_kw { get; set; }

        [Column("ambient_temperature")]
        public decimal Ambient_temperature { get; set; }

        [Column("ghiwhm2")]
        public decimal Ghiwhm2 { get; set; }

        [Column("data_time_stamp ")]
        public DateTime DataTimeStamp { get; set; }

        [Column("paltform_time_stamp ")]
        public DateTime PlatformTimeStamp { get; set; }

        public Plant Plant { get; set; }
    }


    /// <summary>
    ///  Holds all the measurments for solar PREDICTION
    /// </summary>
    [Table("solar_energy_prediction", Schema = "data")]
    public partial class SolarEnergyPrediction
    {
        [Column("plant_id")]
        public int PlantId { get; set; }

        [Column("power_kw")]
        public decimal Power_kw { get; set; }

        [Column("ambient_temperature")]
        public decimal Ambient_temperature { get; set; }

        [Column("ghiwhm2")]
        public decimal Ghiwhm2 { get; set; }

        [Column("data_time_stamp ")]
        public DateTime DataTimeStamp { get; set; }

        [Column("paltform_time_stamp ")]
        public DateTime PlatformTimeStamp { get; set; }

        public Plant Plant { get; set; }
    }



    /// <summary>
    ///  Holds all the measurments for wind PRODUCTION
    /// </summary>
    [Table("wind_energy_production", Schema = "data")]
    public partial class WindEnergyProduction
    {
        [Column("plant_id")]
        public int PlantId { get; set; }
        
        [Column("power_kw")]
        public decimal Power_kw { get; set; }

        [Column("speed_ms")]
        public decimal Speed_ms { get; set; }

        [Column("direction_deg")]
        public decimal Direction_deg { get; set; }
        
        [Column("data_time_stamp ")]
        public DateTime DataTimeStamp { get; set; }

        [Column("paltform_time_stamp ")]
        public DateTime PlatformTimeStamp { get; set; }

        public Plant Plant { get; set; }
    }



    /// <summary>
    ///  Holds all the measurments for wind PREDICTION
    /// </summary>
    [Table("wind_energy_prediction", Schema = "data")]
    public partial class WindEnergyPrediction
    {
        [Column("plant_id")]
        public int PlantId { get; set; }

        [Column("power_kw")]
        public decimal Power_kw { get; set; }

        [Column("speed_ms")]
        public decimal Speed_ms { get; set; }

        [Column("direction_deg")]
        public decimal Direction_deg { get; set; }

        [Column("data_time_stamp ")]
        public DateTime DataTimeStamp { get; set; }

        [Column("paltform_time_stamp ")]
        public DateTime PlatformTimeStamp { get; set; }

        public Plant Plant { get; set; }
    }




}
