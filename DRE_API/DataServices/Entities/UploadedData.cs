using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApiData.Entities
{

    /// <summary>
    ///  Holds all data from uploaded files
    /// </summary>
    [Table("uploadeddata", Schema = "data")]
    public partial class UploadedData
    {
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int Id { get; set; }

        [Column("added_timestamp")]
        public DateTime AddedTimestamp { get; set; }

        [Column("plant_key")]
        public string PlantKey { get; set; }
 
        [Column("filename")]
        public string FileName { get; set; }

        [Column("datatype")]
        public string Datatype { get; set; }

        [Column("user_email")]
        public string UserEmail { get; set; }

        [Column("aux")]
        public string Aux { get; set; }

        [Column("valueType")]
        public string ValueType { get; set; }

        [Column("value")]
        public double Value { get; set; }

        [Column("value_string")]
        public string ValueStr { get; set; }

        [Column("value_timestamp")]
        public DateTime ValueTimeStamp { get; set; }
    }


    /// <summary>
    ///  Holds all data from uploaded files
    /// </summary>
    [Table("csv_links", Schema = "data")]
    public partial class CVSLinks
    {
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int Id { get; set; }

        [Column("added_timestamp")]
        public DateTime AddedTimestamp { get; set; }
    
        [Column("filepath")]
        public string FileName { get; set; }

        [Column("jobid")]
        public int JobId { get; set; }

      
    }



}
