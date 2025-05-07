using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebApiData.Entities;

namespace WebApiData.Entities
{
    /// <summary>
    /// This table holds the 3 types of plants: Solar, Wind, Hybrid
    /// </summary>
    [Table("plant_type", Schema = "masterdata")]
    public partial class PlantType
    {

        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int Id { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [Column("type")]
        public string Type { get; set; }


        // Navigation property
        public ICollection<Plant> Plant { get; set; }
    }


    /// <summary>
    /// This table holds the methods of retrieval of data
    /// </summary>
    [Table("retrieval_method_type", Schema = "masterdata")]
    public partial class RetrievalMethodType
    {
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int Id { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [Column("type")]
        public string Type { get; set; }


        // Navigation property
        public ICollection<Endpoint> Endpoint { get; set; }
    }


    /// <summary>
    /// This table holds the methods of retrieval of data
    /// </summary>
    [Table("data_format", Schema = "masterdata")]
    public partial class DataFormat
    {
        [Column("id")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Key]
        public int Id { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [Column("type")]
        public string Type { get; set; }


        // Navigation property
        public ICollection<Endpoint> Endpoint { get; set; }
    }


    



}
