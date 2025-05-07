using Org.BouncyCastle.Asn1.Ocsp;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;


namespace WebApiData.Entities
{
    /// <summary>
    /// This table holds the plants
    /// </summary>
    [Table("plant", Schema = "masterdata")]
    public partial class Plant
    {
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int Id { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [Column("first_owner")]
        public string FirstOwner { get; set; }

        [Column("descriptor")]
        public string Descriptor { get; set; }

        [Column("latitude")]
        public decimal Latitude { get; set; }

        [Column("longitude")]
        public decimal Longitude { get; set; }

        [Column("radius")]
        public int Radius { get; set; }

        [Column("plant_type_id")]
        public int PlantTypeId { get; set; }

        [Column("plant_type")]
        public PlantType PlantType { get; set; }

    }

    /// <summary>
    /// This table holds the sensors
    /// </summary>
    [Table("sensor", Schema = "masterdata")]
    public partial class Sensor
    {
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int Id { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [Column("type")]
        public string Type { get; set; }

        [Column("unit")]
        public string Unit { get; set; }

        [Column("descriptor")]
        public string Descriptor { get; set; }

    }



    /// <summary>
    /// This table holds the jobs main 
    /// </summary>
    [Table("jobs", Schema = "masterdata")]
    public partial class JobsDb
    {
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int Id { get; set; }

        [Column("jobKey")]
        public string JobKey { get; set; }

        [Column("datetime")]
        public DateTime Datetime { get; set; }

        [Column("energySource")]
        public string EnergySource { get; set; }

        [Column("plan")]
        public string Plan { get; set; }// basic, premium other

        [Column("progress")]
        public string Progress { get; set; }

        [Column("parameters")]
        public string Parameters { get; set; }

        [Column("downloadUrl")]
        public string DownloadUrl { get; set; }

        [Column("forType")]
        public string ForType { get; set; }  //forecast or assessment

        [Column("keyHandler")]
        public string KeyHandler { get; set; }  //to use if I need more keys

        [Column("userEmail")]
        public string UserEmail { get; set; }

        [Column("comments")]
        public string Comments { get; set; }

        [Column("file")]
        public string UploadedFile { get; set; }

        [Column("isdeleted")]
        public bool IsDeleted { get; set; }

        [Column("isuivisible")]
        public bool IsUivisible { get; set; }

        [Column("requestserver")]
        public string RequestServer { get; set; }

        [Column("answer")]
        public string Answer { get; set; }

        [Column("statuscode")]
        public int StatusCode { get; set; }

        public ICollection<JobsResponses> Responses { get; set; } = new List<JobsResponses>();

    }
 

    /// <summary>
    /// This table holds the jobs details 
    /// </summary>
    [Table("jobsresponses", Schema = "data")]
    public partial class JobsResponses
    {
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int Id { get; set; }

        [ForeignKey("JobId")]
        public JobsDb Job { get; set; }

        [Column("job_id")]
        public int JobId { get; set; }

        [Column("datetime")]
        public DateTime Datetime { get; set; }

        [Column("energySource")]
        public string EnergySource { get; set; }

        [Column("status")]
        public string Status { get; set; }
        [Column("error")]
        public string Error { get; set; }

        [Column("payload")]
        public string Payload { get; set; }

        [Column("payloadfixed")]
        public string PayloadFixed { get; set; }

        [Column("responseserver")]
        public string ResponseServer { get; set; }

        public ICollection<JobFiles> Files { get; set; } = new List<JobFiles>();


    }


    /// <summary>
    /// This table holds the jobs details files
    /// </summary>
    [Table("jobfiles", Schema = "data")]
    public partial class JobFiles
    {
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int Id { get; set; }

        [ForeignKey("JobResponseId")]
        public JobsResponses JobsResponses { get; set; }

        [Column("job_response_id")]
        public int JobResponseId { get; set; }

        [Column("file_name")]
        public string Filename { get; set; }


        [Column("file_path")]
        public string FilePath { get; set; }


        [Column("file_size")]
        public int FileSize { get; set; }

    }

}