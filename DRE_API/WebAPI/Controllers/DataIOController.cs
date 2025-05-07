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
using CsvHelper.Configuration;
using CsvHelper;
using System.Globalization;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using WebApiData.Services;
using WebApi.Helpers;
using NetTopologySuite.Mathematics;
using static System.Runtime.InteropServices.JavaScript.JSType;
using WebApi.Helpers.Extensions;
using Microsoft.IdentityModel.Tokens;



namespace WebApi.Controllers
{

   public class DataIOController(IServiceProvider serviceProvider) : BaseController<DataIOController>(serviceProvider)  
    {
        private readonly IUploadedDataService _uploadedDataService = serviceProvider.GetRequiredService<IUploadedDataService>();
        //private readonly IConfiguration _iConfig;
        #region Demo files old upload

        [Authorize]
        [HttpPost("uploadfiledemo")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UploadFileDemo([FromForm] IFormFile file, [FromForm] UploadSettings uploadSettings)
        {
            if (file == null || file.Length == 0 || file.ContentType != "text/csv")
            {
               
                return StatusCode(StatusCodes.Status406NotAcceptable, "Incorrect input file.");
            }

            string fileLength = "";
   

            try
            {

                if (uploadSettings.DataType == "windrose")
                {
                    var windRoseList = new List<WindRose>();

                    using (var reader = new StreamReader(file.OpenReadStream()))
                    {
                        string? line;
                        bool firstLine = true;
                      

                       

                        while ((line = await reader.ReadLineAsync()) != null)
                        {
                            if (firstLine)
                            {
                                firstLine = false;
                                continue; // skip header
                            }

                            var parts = line.Split('\t'); // adjust to ',' if your CSV is comma-separated

                            if (parts.Length < 7) continue;
                            try
                            {
                                var item = new WindRose
                                {
                                    Direction = parts[0],
                                    Zero = double.Parse(parts[1], CultureInfo.InvariantCulture),
                                    Five = double.Parse(parts[2], CultureInfo.InvariantCulture),
                                    Ten = double.Parse(parts[3], CultureInfo.InvariantCulture),
                                    Fifteen = double.Parse(parts[4], CultureInfo.InvariantCulture),
                                    Twenty = double.Parse(parts[5], CultureInfo.InvariantCulture),
                                    Moretwenty = double.Parse(parts[6], CultureInfo.InvariantCulture),

                                    // Apply uploaded settings
                                    PlantId = 0,
                                    JobId = 0,
                                    Assessment = "windabout",
                                    DateFrom = DateTime.Now.ToUniversalTime(),
                                    DateTo = DateTime.Now.ToUniversalTime(),
                                    DateKey = DateTime.Now.ToUniversalTime().ToLongDateString()
                                };

                                windRoseList.Add(item);
                            }
                            catch
                            {
                                // Optional: log or collect bad lines
                                continue;
                            }
                        }

                    }
                    fileLength = windRoseList.Count.ToString();
                    await _uploadedDataService.StoreWindRose(windRoseList);
                }



                if (uploadSettings.DataType == "wind_directional_statiscits")
                {

                    var windDirectionalList = new List<WindDirectional>();

                    using (var reader = new StreamReader(file.OpenReadStream()))
                    {
                        string? line;
                        bool firstLine = true;

                        while ((line = await reader.ReadLineAsync()) != null)
                        {
                            if (firstLine)
                            {
                                firstLine = false;
                                continue; // skip header
                            }

                            var parts = line.Split(','); // CSV is comma-separated

                            if (parts.Length < 8) continue; // skip malformed lines

                            try
                            {
                                var item = new WindDirectional
                                {
                                    Direction = parts[0].Trim(),
                                    Frequency = double.Parse(parts[1], CultureInfo.InvariantCulture),
                                    WeibulShape = double.Parse(parts[2], CultureInfo.InvariantCulture),
                                    WeibulScale = double.Parse(parts[3], CultureInfo.InvariantCulture),
                                    Mean = double.Parse(parts[4], CultureInfo.InvariantCulture),
                                    NineFive = double.Parse(parts[5], CultureInfo.InvariantCulture),
                                    NineSeven = double.Parse(parts[6], CultureInfo.InvariantCulture),
                                    NineNine = double.Parse(parts[7], CultureInfo.InvariantCulture),

                                    PlantId = 0,
                                    JobId = 0,
                                    Assessment = "windabout",
                                    DateFrom = DateTime.Now.ToUniversalTime(),
                                    DateTo = DateTime.Now.ToUniversalTime(),
                                    DateKey = DateTime.Now.ToUniversalTime().ToLongDateString()
                                };

                                windDirectionalList.Add(item);
                            }
                            catch
                            {
                                // Optional: log bad lines
                                continue;
                            }
                        }

                    }
                    fileLength = windDirectionalList.Count.ToString();
                    await _uploadedDataService.StoreWindDirectional(windDirectionalList);


                }
















                    if (uploadSettings.DataType == "power_curve")
                {
                    List<WindPowerData> windData = ParseCsvData<WindPowerData, WindPowerDataMap>(file);
                    fileLength = windData.Count.ToString();

                }


                if (uploadSettings.DataType == "power_output_timeseries")
                {
                    List<PowerWindData> windData = ParseCsvData<PowerWindData, PowerWindDataMap>(file);
                    fileLength = windData.Count.ToString();
                }


                if (uploadSettings.DataType == "weibull_values")
                {
                    List<WeibullData> windData = ParseCsvData<WeibullData, WeibullDataMap>(file);
                    fileLength = windData.Count.ToString();
                }

                if (uploadSettings.DataType == "speed_histogram_values")
                {
                    List<WindFrequencyData> windData = ParseCsvData<WindFrequencyData, WindFrequencyDataMap>(file);
                    fileLength = windData.Count.ToString();
                }


                if (uploadSettings.DataType == "wind_speed_statistics")
                {
                    List<WindDirectionStatisticsData> windData = ParseCsvData<WindDirectionStatisticsData, WindDirectionStatisticsDataMap>(file);
                    fileLength = windData.Count.ToString();
                }


                if (uploadSettings.DataType == "wind_speed_timeseries")
                {
                    List<WindSpeedTimeSeriesData> windData = ParseCsvData<WindSpeedTimeSeriesData, WindSpeedTimeSeriesDataMap>(file);
                    fileLength = windData.Count.ToString();

                
                    // Prepare a list to accumulate all UploadedData entities.
                    List<UploadedData> uploadDataEntities = [];

                    // These parameters can be determined by your business logic.
                    string plantKey = "PlantA";
                    string fileName = "wind_timeseries.csv";
                    string dataType = "WindTimeSeries";
                    string userEmail = "user@example.com";

                    // For each record, create multiple entries (one per property if needed).
                    foreach (var record in windData)
                    {
                        // Create an entry for the datetime value.
                        uploadDataEntities.Add(new UploadedData
                        {
                            PlantKey = plantKey,
                            FileName = fileName,
                            Datatype = dataType,
                            UserEmail = userEmail,
                            Aux = "DateTime",
                            ValueType = nameof(DateTime),
                            ValueTimeStamp = record.DateTime.ToUniversalTime()
                        });

                        // Create an entry for the wind speed value.
                        uploadDataEntities.Add(new UploadedData
                        {
                            PlantKey = plantKey,
                            FileName = fileName,
                            Datatype = dataType,
                            UserEmail = userEmail,
                            Aux = "WindSpeedInMPerS",
                            ValueType = nameof(Double),
                            Value = record.WindSpeedInMPerS
                        });

                        // Create an entry for the wind direction value.
                        uploadDataEntities.Add(new UploadedData
                        {
                            PlantKey = plantKey,
                            FileName = fileName,
                            Datatype = dataType,
                            UserEmail = userEmail,
                            Aux = "WindDirectionInDeg",
                            ValueType = nameof(Double),
                            Value = record.WindDirectionInDeg
                        });
                    }

                    // Now, call the service method to insert all records in one batch.
                    await _uploadedDataService.SaveUploadedDataBatchAsync(uploadDataEntities);



                }


            }
            catch (Exception ex)
            {
                return BadRequest("Error:" + ex.Message);

            }
            return Ok($"Total records uploaded: {fileLength}  for plant {uploadSettings.PlantKey} and type: {uploadSettings.DataType}" );
        }

        public List<T> ParseCsvData<T, TMap>(IFormFile file)
            where T : class
            where TMap : ClassMap<T>
        {
            using (var reader = new StreamReader(file.OpenReadStream()))
            using (var csv = new CsvReader(reader, CultureInfo.InvariantCulture))
            {
                // Register the mapping class for T.
                csv.Context.RegisterClassMap<TMap>();
                // Parse the CSV records into a list of T.
                var records = csv.GetRecords<T>().ToList();
                return records;
            }
        }

        #endregion


        [CustomTokenAuthorizeAttribute]
        [HttpPost("uploadfile")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UploadFile(IFormFile[] file,  [FromForm] string guid, [FromForm] string aux, [FromForm] string folderPath, [FromForm] string filename)
        {
            List<string> paths = new List<string>();
            string fullPath = "";
            bool useFileName = false;

            if (filename.IsNullOrEmpty())
            {
                useFileName = false;
            }
            else
            {
                useFileName = true;
            }


                try
                {

                    if (file == null || file.Length == 0)
                    {

                        return StatusCode(StatusCodes.Status406NotAcceptable, "Incorrect input file.");
                    }

                    foreach (var uploadedFile in file)
                    {

                        if (uploadedFile.ContentType != "text/csv")
                        {
                            FileValidationResult error = new FileValidationResult()
                            {
                                message = "Not a CSV",
                                file_path = "",
                                valid = false,
                                guid = "",
                                aux = ""
                            };
                            return StatusCode(StatusCodes.Status500InternalServerError, error);
                        }



                        fullPath = Path.Combine(folderPath, useFileName? filename: uploadedFile.FileName);

                        if (!Directory.Exists(folderPath))
                        {
                            Directory.CreateDirectory(folderPath);
                        }

                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            await uploadedFile.CopyToAsync(stream);
                        }

                        paths.Add(fullPath);

                    }
                }
                catch (Exception ex)
                {

                    FileValidationResult error = new FileValidationResult()
                    {
                        message = ex.Message,
                        file_path = string.Join("|", paths),
                        valid = false,
                        guid = guid,
                        aux = aux
                    };
                    return StatusCode(StatusCodes.Status500InternalServerError, error);
                }

            FileValidationResult fileValidationResult = new FileValidationResult();
            fileValidationResult.valid = true;
            fileValidationResult.message = "Success";
            fileValidationResult.file_path = string.Join("|", paths);
            fileValidationResult.guid = guid;
            fileValidationResult.aux = aux;
            return StatusCode(StatusCodes.Status200OK, fileValidationResult);

 
        }


    }



}
