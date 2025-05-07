using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApiData.Entities
{

    /// <summary>
    ///  Holds all the settigns for getting data from other sources
    /// </summary>
    [Table("endpoint", Schema = "masterdata")]
    public partial class Endpoint
    {
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int Id { get; set; }

        [Column("name")]
        public string Name { get; set; } // Name of this setting

        [Column("plant_id")]
        public int PlantId { get; set; }

        [Column("retrieval_method_type_id")]
        public int RetrievalMethodTypeId { get; set; } //what kind of methods, GET, DB, Push_GET,Receive_GET, FTP

        [Column("data_format_id")]
        public int DataFormatId { get; set; } //JSON, CSV

        [Column("url")]
        public string Url { get; set; }  //URL

        [Column("measuring_sensors")]
        public string MeasuringSensors { get; set; }  // What values we expect to get (JSON)

        [Column("schedule")]
        public string Schedule { get; set; } // when to get the data (JSON)


        [Column("apikey")]
        public string Apikey { get; set; }

        [Column("username")]
        public string Username { get; set; }
        
        [Column("password")]
        public string Password { get; set; }

        [Column("response_schema")]
        public string ResponseSchema { get; set; }


        [Column("response_class")]
        public string ResponseClass { get; set; }


        [Column("ask_data")]
        public bool AskData { get; set; } //indicates if this is use to get scheduled data


        [Column("break_period")]
        public string BreakPeriod { get; set; } //If data (as seen during test) takes time to response, break per hour etc.



        [Column("aux")]
        public string Aux { get; set; } // when to get the data (JSON)

        public Plant Plant { get; set; }

        public RetrievalMethodType RetrievalMethodType { get; set; }

        public DataFormat DataFormat { get; set; }
    }




    /// <summary>
    ///  Holds when the data were retrieved
    /// </summary>
    [Table("retrieval_log", Schema = "masterdata")]
    public partial class RetrievalLog
    {
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int Id { get; set; }

        [Column("start_date ")]
        public DateTime StartDate { get; set; }

        [Column("end_date ")]
        public DateTime EndDate { get; set; }

        [Column("endpoint_id")]
        public int EndpointId { get; set; }

        [Column("records")]
        public int Records { get; set; } // when to get the data (JSON)

        [Column("is_success")]
        public bool IsSuccess { get; set; } // if the retrieval was successful

        [Column("error")]
        public string Error { get; set; } // if not, then log the error

        public Endpoint Endpoint { get; set; }
    }

}
