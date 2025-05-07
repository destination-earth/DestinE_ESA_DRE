using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Numerics;

namespace WebApiData.Entities
{

    /// <summary>
    /// Holds the demo data for solar,wind result graphs etc
    /// </summary>
    [Table("demodata", Schema = "graphdata")]
    public partial class DemoData
    {
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int Id { get; set; }

        [Column("key")] //A key to identify data
        public string Key { get; set; }

        /// <summary>
        /// Data type of the data, CSV or JSON
        /// </summary>
        [Column("datatype")]  
        public string DataType { get; set; }

        /// <summary>
        /// Class to use to serialize
        /// </summary>
        [Column("classdeserial")]
        public string ClassDeSerial { get; set; }

        /// <summary>
        /// Optional id of a plant
        /// </summary>
        [Column("plant_id")]
        public int PlantId { get; set; }
 

        /// <summary>
        /// The payload of the sample data.
        /// </summary>
        [Column("payload")] 
        public string Payload { get; set; }


    }








    /// <summary>
    /// Holds the data respond for Assessment Solar, result graphs, About, Basic, Premium
    /// </summary>
    [Table("dnighi", Schema = "graphdata")]
    public partial class DniGhi
    {
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public long Id { get; set; }


        [Column("type")] //this is either ghi or dni
        public string Type { get; set; }

        [Column("value")] //this is the value of the ghi or dni
        public double Value { get; set; }


        [Column("month")] //this the month of the value
        public string Month { get; set; }

        [Column("plant_id")]
        public int PlantId { get; set; }

        [Column("job_id")]
        public int JobId { get; set; }


        [Column("assessment")] //about, basic, premium
        public string Assessment { get; set; }

        [Column("date_from")] //date start of the data
        public DateTime DateFrom { get; set; }


        [Column("date_to")] //date end of the data
        public DateTime DateTo { get; set; }


        [Column("date_key")] //string of the date for search
        public string DateKey { get; set; }


    }



    /// <summary>
    /// Holds the data for Assessment Wind Speed Distribution
    /// </summary>
    [Table("windspeeddist", Schema = "graphdata")]
    public partial class WindSpeedDist
    {
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public long Id { get; set; }
 

        [Column("counts")] //this is the value counts/frequency
        public double Value { get; set; }


        [Column("curvea")] //this is the value of curve A
        public double CurveA { get; set; }


        [Column("curveb")] //this is the value curve B
        public double CurveB { get; set; }


        [Column("xaxis")] //this is the value of the X axis
        public double Xaxis { get; set; }


        [Column("plant_id")]
        public int PlantId { get; set; }

        [Column("job_id")]
        public int JobId { get; set; }


        [Column("assessment")] //about, basic, premium
        public string Assessment { get; set; }

        [Column("date_from")] //date start of the data
        public DateTime DateFrom { get; set; }


        [Column("date_to")] //date end of the data
        public DateTime DateTo { get; set; }


        [Column("date_key")] //string of the date for search
        public string DateKey { get; set; }


    }


    /// <summary>
    /// Holds the data for Assessment Wind Rose
    /// </summary>
    [Table("windrose", Schema = "graphdata")]
    public partial class WindRose
    {
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public long Id { get; set; }


        [Column("direction")] 
        public string Direction { get; set; }

        [Column("zero")] 
        public double Zero { get; set; }

        [Column("five")]
        public double Five { get; set; }

        [Column("ten")]
        public double Ten { get; set; }

        [Column("fifteen")]
        public double Fifteen { get; set; }

        [Column("twenty")]
        public double Twenty { get; set; }

        [Column("moretwenty")]
        public double Moretwenty { get; set; }
        

        [Column("plant_id")]
        public int PlantId { get; set; }

        [Column("job_id")]
        public int JobId { get; set; }


        [Column("assessment")] //about, basic, premium
        public string Assessment { get; set; }

        [Column("date_from")] //date start of the data
        public DateTime DateFrom { get; set; }


        [Column("date_to")] //date end of the data
        public DateTime DateTo { get; set; }


        [Column("date_key")] //string of the date for search
        public string DateKey { get; set; }


    }


    /// <summary>
    /// Holds the data for Directional Statistics Outputs
    /// </summary>
    [Table("winddirectional", Schema = "graphdata")]
    public partial class WindDirectional
    {
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public long Id { get; set; }


        [Column("direction")]
        public string Direction { get; set; }

        [Column("frequency")] 
        public double Frequency { get; set; }


        [Column("weibul_shape")]
        public double WeibulShape { get; set; }


        [Column("weibul_scale")]
        public double WeibulScale { get; set; }

        [Column("mean")]
        public double Mean { get; set; }



        [Column("nine_five")]
        public double NineFive { get; set; }

        [Column("nine_seven")]
        public double NineSeven { get; set; }

        [Column("nine_nine")]
        public double NineNine { get; set; }





        [Column("plant_id")]
        public int PlantId { get; set; }

        [Column("job_id")]
        public int JobId { get; set; }


        [Column("assessment")] //about, basic, premium
        public string Assessment { get; set; }

        [Column("date_from")] //date start of the data
        public DateTime DateFrom { get; set; }


        [Column("date_to")] //date end of the data
        public DateTime DateTo { get; set; }


        [Column("date_key")] //string of the date for search
        public string DateKey { get; set; }


    }

}
