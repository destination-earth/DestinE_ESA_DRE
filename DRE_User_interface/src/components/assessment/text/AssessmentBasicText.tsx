import { useTranslation } from "react-i18next";

export const WindAssessmentBasic = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p>
        {t(
          "forecast.about.wind.basic",
          "Retrieve Wind Speed data and Resource Assessment analytics for a selected location and period.",
        )}
      </p>
      <p>
        {t(
          "forecast.about.wind.basic1",
          "Get wind speed historical data and generate directional statistics, histograms, fitted Weibull distribution and wind roses. Simply enter the coordinates (Latitude & Longitude) and the height of the desired location.",
        )}
      </p>
      <p>
        {t(
          "forecast.about.wind.basic2",
          "You can also download the returned data in CSV format for further analysis. This tool helps users analyse wind resources by providing essential insights into site-specific wind resource availability.",
        )}
      </p>
    </div>
  );
};

export const SolarAssessmentBasic = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p>
        {t(
          "forecast.about.solar.basic",
          "This tool helps optimize solar energy planning by providing essential insights into site-specific solar resource availability. ",
        )}
      </p>
      <p>
        {t(
          "forecast.about.solar.basic1",
          "Get accurate monthly mean values of Global Horizontal Irradiance (GHI) and Direct Normal Irradiance (DNI) for your location. Simply enter your latitude and longitude, along with the start and end dates, to generate a detailed visualization of solar radiation trends.",
        )}
      </p>
      <p>
        {t(
          "forecast.about.solar.basic1",
          "Simply enter your latitude and longitude, along with the start and end dates, to generate a detailed visualization of solar radiation trends.",
        )}
      </p>
      <p>
        {t(
          "forecast.about.solar.basic2",
          "You can also download the returned data in CSV format for further analysis. The output file can be in 1min, 15min, hourly or monthly.",
        )}
      </p>
    </div>
  );
};