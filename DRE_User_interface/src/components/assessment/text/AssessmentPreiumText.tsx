import { useTranslation } from "react-i18next";

export const WindAssessmentPremium = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p>
        {t(
          "forecast.about.wind.premium",
          "Retrieve wind speed data and energy production estimates tailored to your wind park:"
        )}
      </p>
      <ul className="list-disc pl-6 space-y-2 marker:text-blue-500">
        <li className="text-gray-800">
          {t(
            "forecast.about.wind.premium.bullet1",
            "Enter your latitude and longitude, along with the start and end dates, to generate energy output data."
          )}
        </li>
        <li className="text-gray-800">
          {t(
            "forecast.about.wind.premium.bullet2",
            "Provide your turbine specifications, including:"
          )}
          <ul className="pl-6 space-y-1 mt-1">
            <li className="flex items-start">
              <div className="h-1.5 w-1.5 rounded-full border border-blue-500 mt-2 mr-2 flex-shrink-0"></div>
              <span>
                {t(
                  "forecast.about.wind.premium.subbullet1",
                  "Hub height"
                )}
              </span>
            </li>
            <li className="flex items-start">
              <div className="h-1.5 w-1.5 rounded-full border border-blue-500 mt-2 mr-2 flex-shrink-0"></div>
              <span>
                {t(
                  "forecast.about.wind.premium.subbullet2",
                  "Power curve"
                )}
              </span>
            </li>
          </ul>
        </li>
        <li className="text-gray-800">
          {t(
            "forecast.about.wind.premium.bullet3",
            "If a power curve is not available, you can select from a list of reference power curve models."
          )}
        </li>
        <li className="text-gray-800">
          {t(
            "forecast.about.wind.premium.bullet4",
            "Download the data in CSV format for further analysis."
          )}
        </li>
      </ul>
    </div>
  );
};

export const SolarAssessmentPremium = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p>
        {t(
          "forecast.about.solar.premium",
          "Get solar radiation data and energy production estimates tailored to your solar park. Enter your latitude and longitude, along with the start and end dates, to generate a detailed visualization of Global Horizontal Irradiance (GHI) and Direct Normal Irradiance (DNI)."
        )}
      </p>
      <p>
        {t(
          "forecast.about.solar.premium1",
          "Additionally, provide your solar park specifications—including panel tilt, azimuth, tracking type (fixed, single-axis, or dual-axis), and capacity—to receive the corresponding power production estimation."
        )}
      </p>
      <p>
        {t(
          "forecast.about.solar.premium2",
          "The generated data is available for download in CSV format for further analysis. The output file can be in 1min, 15min, hourly or monthly."
        )}
      </p>
    </div>
  );
};