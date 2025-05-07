using DataServices.Models;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using WebApiData.Entities;


namespace Interfaces
{
    public interface IExternalHttpService
    {
        //Solar Forecast
        public Task<ExtSolarValidateResponse> ValidateSolarCsvAsync(string fullPath);

        public Task<ExtSolarProcessResponse> ProcessTrainSolarAsync(ExtSolarProcessRequest dataPayload);

        public Task<string> ProcessInferenceSolarAsync(ExtSolarInferenceRequest dataPayload);

        //Solar Assessment
        /*
                Pending...

        */


        public Task<ExtSolarAssessmentGenericResponse> ProcessSolarAssessmentBasicAsync(ExtSolarBasicAssessmentRequest dataPayload);
        
        public Task<ExtSolarAssessmentGenericResponse> ProcessSolarAssessmentPremiumAsync(ExtSolarPremiumAssessmentRequest dataPayload);

        public Task<ExtSolarAssessmentGenericResponse> SolarForecastParkSpecificationsAsync(ExtSolarForecastParkSpecificationsRequest dataPayload);


        //Wind Assessment
        public Task<ExtWindAssessmentGenericResponse> WindAssessmentPremiumAsync(ExtWindAssessmentPremiumRequest dataPayload);
        public Task<ExtWindAssessmentGenericResponse> WindAssessmentBasicAsync(ExtWindAssessmentBasicRequest dataPayload);

        //Wind Forecast
        public Task<ExtWindForecastGenericResponse> WindForecastPremiumAsync(ExtWindForecastPremiumRequest dataPayload);

        public Task<ExtWindForecastGenericResponse> WindForecastBasicAsync(ExtWindForecastBasicRequest dataPayload);

    }
}

