using System;
using System.Collections.Generic;
using System.Linq;
using WebApiData.Entities;
using WebApiData.Helpers;
using Interfaces;
using DataServices.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Org.BouncyCastle.Asn1.Pkcs;
using serial = System.Text.Json;

namespace WebApiData.Services
{


    public class AssessmentService : IAssessmentService
    {
        private readonly DataContext _context;
        public AssessmentService(DataContext context)
        {
            _context = context;
        }

        public string Initialize(string asset, DateTime startDate, DateTime endDate)
        {
            throw new NotImplementedException();
        }

        #region Solar Assessment
        public SolarBasicResponse AboutSolar()
        {
            var dummy = DummyDataGenerator.GenerateDummySolarData();
            SolarBasicResponse solarBasicResponse = new SolarBasicResponse();
            solarBasicResponse.dni = dummy.dni;
            solarBasicResponse.ghi = dummy.ghi;
            solarBasicResponse.csvLink = dummy.csvLink;
            solarBasicResponse.poweroutput = dummy.poweroutput;
            return solarBasicResponse;
        }

        public SolarBasicResponse SolarBasic(SolarBasicRequest request)
        {
            var dummy = DummyDataGenerator.GenerateDummySolarData();
            SolarBasicResponse solarBasicResponse = new SolarBasicResponse();
            solarBasicResponse.dni = dummy.dni;
            solarBasicResponse.ghi = dummy.ghi;
            solarBasicResponse.csvLink = dummy.csvLink;
            solarBasicResponse.poweroutput = dummy.poweroutput;
            return solarBasicResponse;
        }

        public SolarPremiumResponse SolarPremium(SolarPremiumRequest request)
        {
            var dummy = DummyDataGenerator.GenerateDummySolarData();

            SolarPremiumResponse solarPremiumResponse = new SolarPremiumResponse();
            solarPremiumResponse.dni = dummy.dni;
            solarPremiumResponse.ghi = dummy.ghi;
            solarPremiumResponse.csvLink = dummy.csvLink;
            solarPremiumResponse.outputPower = dummy.outputPower;

            return solarPremiumResponse;
        }

        #endregion

        #region Wind Assessment

        public WindBasicResponse AboutWind()
        {
            var windBasicResponsePayload = _context.DemoData.Where(p => p.Key == "assessment_wind_about").FirstOrDefault();
            var windBasicResponseB = serial.JsonSerializer.Deserialize<WindBasicResponse>(windBasicResponsePayload.Payload);
            var complex = _context.DemoData.Where(p => p.Key == "wind_assessment_complex").FirstOrDefault();
            var res = serial.JsonSerializer.Deserialize<List<WindBasicResponseComplex>>(complex.Payload);

            var stats = _context.DemoData.Where(p => p.Key == "wind_annual_stats").FirstOrDefault();
            var annual_stats = serial.JsonSerializer.Deserialize<AnnualStats>(stats.Payload);
            windBasicResponseB.complex = res;
            windBasicResponseB.jobtype = JobsTypesFilters.assessment;
            windBasicResponseB.annual_stats = annual_stats;
            return windBasicResponseB;
        }

        public WindBasicResponse WindBasic(WindBasicRequest request, string jobKey)
        {
            var windBasicResponse = DummyDataGenerator.GenerateDummyWindBasicResponse(["https://hyrefapp.dev.desp.space/downloads/wind_speed_timeseries.csv", "https://hyrefapp.dev.desp.space/downloads/wind_speed_timeseries.csv"]);
            return windBasicResponse; ;
        }

        public WindPremiumResponse WindPremium(WindPremiumRequest request, string jobKey)
        {
            var windPremiumResponse = DummyDataGenerator.GenerateDummyWindPremiumResponse();
            return windPremiumResponse;
        }

        public WindPremiumResponse WindPremiumWithFile(IFormFile file, WindPremiumRequest request, string jobKey)
        {
            var windPremiumResponse = DummyDataGenerator.GenerateDummyWindPremiumResponse();
            return windPremiumResponse;
        }


        private RoseDiagramData ConvertRoseDbToDto(List<WindRose> windRoses)
        {
            var directions = windRoses.Select(w => w.Direction).ToArray();

            var windSpeedRange = new List<WindSpeedRange>
                {
                    new WindSpeedRange
                    {
                        Label = "0-5 m/s",
                        Data = windRoses.Select(w => w.Zero).ToArray()
                    },
                    new WindSpeedRange
                    {
                        Label = "5-10 m/s",
                        Data = windRoses.Select(w => w.Five).ToArray()
                    },
                    new WindSpeedRange
                    {
                        Label = "10-15 m/s",
                        Data = windRoses.Select(w => w.Ten).ToArray()
                    },
                    new WindSpeedRange
                    {
                        Label = "15-20 m/s",
                        Data = windRoses.Select(w => w.Fifteen).ToArray()
                    },
                    new WindSpeedRange
                    {
                        Label = "20-25 m/s",
                        Data = windRoses.Select(w => w.Twenty).ToArray()
                    },
                    new WindSpeedRange
                    {
                        Label = ">25 m/s",
                        Data = windRoses.Select(w => w.Moretwenty).ToArray()
                    }
                };

            return new RoseDiagramData
            {
                directions = directions,
                windSpeedRange = windSpeedRange
            };
        }


        #endregion

    }

    public static class DummyDataGenerator
    {

        public static string[] links =
                            ["https://hyrefapp.dev.desp.space/downloads/cams_solar_rad_36-9_21-74_15minute.csv",
                            "https://hyrefapp.dev.desp.space/downloads/cams_solar_rad_36-9_21-74_1minute.csv",
                            "https://hyrefapp.dev.desp.space/downloads/cams_solar_rad_36-9_21-74_1hour.csv",
                            "https://hyrefapp.dev.desp.space/downloads/cams_solar_rad_36-9_21-74_1day.csv",
                            "https://hyrefapp.dev.desp.space/downloads/cams_solar_rad_36-9_21-74_1month.csv",
                            ];

        #region Solar Dummy Generation

        public static SolarPremiumResponse GenerateDummySolarData()
        {

            // List of months in order
            string[] months = new string[]
            {
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
            };

            // Define month-dependent means for GHI.
            // The means are chosen so that the highest is in August and the lowest in December.
            // Note: Since the year is not fully symmetric, we set them manually.
            double[] ghiMeans = new double[]
            {
            63928.1, // January
            91832.8, // February
            142478.8, // March
            182691.4, // April
            217341.6, // May
            233903.0, // June
            250360.1, // July
            222524.4, // August (peak)
            169729.9, // September
            121643.7, // October
            81652.8, // November
            67451.5   // December (lowest)
            };

            // Define month-dependent means for DNI.
            double[] dniMeans = new double[]
            {
            91178.1,  // January
            114717.0,  // February
            152252.9,  // March
            180458.3,  // April
            209386.6,  // May
            241252.4, // June
            280784.9, // July
            252259.9, // August (peak)
            200734.7, // September
            154988.2, // October
            117504.0,  // November
            114137.1   // December (lowest)
            };

            double[] powerMeans = new double[]
      {
            300,  // January
            350,  // February
            500,  // March
            700,  // April
            900,  // May
            1100, // June
            1300, // July
            1400, // August (peak)
            1200, // September
            1000, // October
            800,  // November
            250   // December (lowest)
      };



            double powerStdDev = 50;

            var random = new Random();
            var ghiList = new List<ValueMonth>();
            var dniList = new List<ValueMonth>();
            var powerList = new List<ValueMonth>();

            var soalrpowerValue = new List<DateValue>();

            DateTime nowDate = DateTime.Now;
            for (int i = 0; i < months.Length; i++)
            {
                double powerValue = NextGaussian(random, powerMeans[i], powerStdDev);

                // Round to 2 decimals for display purposes.
                ghiList.Add(new ValueMonth { month = months[i], value = ghiMeans[i] });
                dniList.Add(new ValueMonth { month = months[i], value = dniMeans[i] });
                powerList.Add(new ValueMonth { month = months[i], value = Math.Round(powerValue, 2) });

                soalrpowerValue.Add(new DateValue { dateTime = nowDate.AddHours(i), value = Math.Round(powerValue, 2) });
            }

            return new SolarPremiumResponse
            {
                ghi = ghiList,
                dni = dniList,
                csvLink = links,
                outputPower = powerList,
                poweroutput = soalrpowerValue

            };
        }

        // Generate a normally distributed random number using the Box–Muller transform.
        public static double NextGaussian(Random random, double mean, double stdDev)
        {
            double u1 = 1.0 - random.NextDouble(); // avoid zero
            double u2 = 1.0 - random.NextDouble();
            double randStdNormal = Math.Sqrt(-2.0 * Math.Log(u1)) * Math.Sin(2.0 * Math.PI * u2);
            return mean + stdDev * randStdNormal;
        }

        #endregion








        /// <summary>
        /// Generates a dummy WindBasicResponse with a wind speed distribution
        /// that is low at 0, peaks at 10, and drops off again at 30.
        /// </summary>
        public static WindBasicResponse GenerateDummyWindBasicResponse(string[] downloadlink)
        {
            string csvData = @"Direction	0-5 m/s	5-10 m/s	10-15 m/s	15-20 m/s	20-25 m/s	>25 m/s
N	0.1412429379	1.553672316	0	0	0	0
NNE	0.6355932203	1.200564972	0	0	0	0
NE	1.553672316	1.412429379	0.8474576271	0	0	0
ENE	1.694915254	5.155367232	3.107344633	0	0	0
E	1.836158192	7.697740113	5.649717514	0.2118644068	0	0
ESE	1.412429379	8.121468927	2.401129944	0	0	0
SE	2.330508475	6.214689266	2.189265537	0	0	0
SSE	0.6355932203	1.059322034	0.4237288136	0	0	0
S	0.7768361582	2.824858757	0.7768361582	0	0	0
SSW	0.4943502825	3.036723164	1.059322034	0	0	0
SW	0.5649717514	3.531073446	1.836158192	0.1412429379	0	0
WSW	0.7062146893	3.389830508	1.836158192	0.6355932203	0	0
W	1.271186441	3.107344633	1.765536723	0.6355932203	0	0
WNW	0.8474576271	7.132768362	1.97740113	0.07062146893	0	0
NW	0.6355932203	1.694915254	0	0	0	0
NNW	0.918079096	0.8474576271	0	0	0	0";

            // Parse the CSV data.
            RoseDiagramData roseData = RoseDiagramDataParser.ParseCsv(csvData);

            return new WindBasicResponse
            {
                CountWindSpeed = new List<XYValues>
                {
                    new XYValues { xvalue = 0,  yvalue = 1.0 },
                    new XYValues { xvalue = 5,  yvalue = 5.0 },
                    new XYValues { xvalue = 10, yvalue = 10.0 },
                    new XYValues { xvalue = 15, yvalue = 7.0 },
                    new XYValues { xvalue = 20, yvalue = 4.0 },
                    new XYValues { xvalue = 25, yvalue = 2.0 },
                    new XYValues { xvalue = 30, yvalue = 1.0 }
                },
                directionalOutputs = new List<DirectionalOutput>
                {
                    new DirectionalOutput
                    {
                        direction = "N",
                        frequency = 0.22,
                        weibullShape = 2.1,
                        weibullScale = 9.8,
                        mean = 8.0,
                        nineFive = 12.0,
                        nineSeven = 14.0,
                        nineNine = 15.5
                    },
                    new DirectionalOutput
                    {
                        direction = "S",
                        frequency = 0.18,
                        weibullShape = 1.9,
                        weibullScale = 10.2,
                        mean = 7.5,
                        nineFive = 11.0,
                        nineSeven = 13.0,
                        nineNine = 14.0
                    }
                },
                roseDiagram = roseData,
                csvLink = downloadlink,
                jobtype = "assessment"
            };
        }

        /// <summary>
        /// Generates a dummy WindPremiumResponse that includes the base WindBasicResponse data
        /// and adds output power data.
        /// </summary>
        public static WindPremiumResponse GenerateDummyWindPremiumResponse()
        {
            // First, generate the basic response
            var basicResponse = GenerateDummyWindBasicResponse(["https://hyrefapp.dev.desp.space/downloads/power_output_timeseries.csv", "https://hyrefapp.dev.desp.space/downloads/wind_speed_timeseries.csv"]);

            var fromSolar = GenerateDummySolarData();

            // Create the premium response and add the additional output power data
            var premiumResponse = new WindPremiumResponse
            {
                CountWindSpeed = basicResponse.CountWindSpeed,
                directionalOutputs = basicResponse.directionalOutputs,
                roseDiagram = basicResponse.roseDiagram,
                csvLink = basicResponse.csvLink,
                outputPower = fromSolar.outputPower,
                jobtype = "assessment"

            };

            return premiumResponse;
        }
    }


    public static class RoseDiagramDataParser
    {
        /// <summary>
        /// Parses CSV text into a RoseDiagramData object.
        /// Assumes the first column header is "Direction" and subsequent columns are wind speed range labels.
        /// Each following row should have a direction and numeric values.
        /// </summary>
        /// <param name="csvText">CSV content as a string.</param>
        /// <param name="delimiter">Delimiter character (default is tab).</param>
        /// <returns>A RoseDiagramData object with directions and wind speed ranges.</returns>
        public static RoseDiagramData ParseCsv(string csvText, char delimiter = '\t')
        {
            var lines = csvText.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
            if (lines.Length == 0)
                throw new Exception("CSV data is empty.");

            // Parse the header row.
            var headers = lines[0].Split(delimiter);
            if (headers.Length < 2)
                throw new Exception("CSV header does not contain enough columns.");

            // Prepare list for directions.
            var directions = new List<string>();

            // Create WindSpeedRange objects for each wind speed range (columns 2+).
            var windSpeedRanges = new List<WindSpeedRange>();
            for (int j = 1; j < headers.Length; j++)
            {
                windSpeedRanges.Add(new WindSpeedRange
                {
                    Label = headers[j],
                    // Initialize the Data array based on the number of data rows (header excluded).
                    Data = new double[lines.Length - 1]
                });
            }

            // Process each data row.
            for (int i = 1; i < lines.Length; i++)
            {
                var parts = lines[i].Split(delimiter);
                if (parts.Length != headers.Length)
                    throw new Exception($"Row {i + 1} does not have the expected number of columns.");

                // First column is the direction.
                directions.Add(parts[0]);

                // Subsequent columns are wind speed values.
                for (int j = 1; j < parts.Length; j++)
                {
                    if (double.TryParse(parts[j], out double value))
                    {
                        windSpeedRanges[j - 1].Data[i - 1] = value;
                    }
                    else
                    {
                        // Optionally handle parsing errors.
                        windSpeedRanges[j - 1].Data[i - 1] = 0;
                    }
                }
            }

            return new RoseDiagramData
            {
                directions = directions.ToArray(),
                windSpeedRange = windSpeedRanges
            };
        }
    }




}
