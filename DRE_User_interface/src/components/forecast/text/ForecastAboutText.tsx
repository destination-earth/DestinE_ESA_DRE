import { useTranslation } from "react-i18next";

export const SolarAboutDescription = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p>
        {t(
          "forecast.about.solar.intro",
          "We provide 2-day ahead power production forecasts, customized to each user's solar park. Users have two options for obtaining their forecasts:",
        )}
      </p>

      <div className="space-y-1">
        <p className="font-medium">
          {t(
            "forecast.about.solar.ml.title",
            "Enhanced Accuracy with Machine Learning",
          )}
        </p>
        <p className="pl-6">
          {t(
            "forecast.about.solar.ml.upload",
            "Users can upload historical power production data (in kW) using our provided template.",
          )}
        </p>
        <p className="pl-6">
          {t(
            "forecast.about.solar.ml.training",
            "A machine learning model will be trained using this data alongside other inputs, and then be inferenced using weather (DT) forecasts, to generate precise 2-day power production forecasts tailored to the specific park.",
          )}
        </p>
      </div>

      <div className="space-y-1">
        <p className="font-medium">
          {t(
            "forecast.about.solar.standard.title",
            "Standard Forecasting Without Historical Data",
          )}
        </p>
        <p className="pl-6">
          {t(
            "forecast.about.solar.standard.estimation",
            "If users choose not to upload historical data, we provide an estimation based on the park's characteristics.",
          )}
        </p>
        <p className="pl-6">
          {t(
            "forecast.about.solar.standard.precision",
            "While slightly less precise, this option still delivers valuable insights for planning and decision-making.",
          )}
        </p>
      </div>

      <p className="font-medium">
        {t("forecast.about.solar.plans.title", "Available forecasting plans:")}
      </p>

      <div className="space-y-1">
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t(
            "forecast.about.solar.plans.onetime.title",
            "One-Time Forecast",
          )}
        </p>
        <p className="pl-6">
          {t(
            "forecast.about.solar.plans.onetime.get",
            "Get a single 2-day forecast with precise insights for solar potential assessment.",
          )}
        </p>
        <p className="pl-6">
          {t(
            "forecast.about.solar.plans.onetime.ideal",
            "Ideal for users who want to test our service before committing.",
          )}
        </p>
      </div>

      <div className="space-y-1">
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t(
            "forecast.about.solar.plans.annual.title",
            "Annual Subscription",
          )}
        </p>
        <p className="pl-6">
          {t(
            "forecast.about.solar.plans.annual.receive",
            "Receive daily updated forecasts throughout the year.",
          )}
        </p>
        <p className="pl-6">
          {t(
            "forecast.about.solar.plans.annual.automated",
            "Fully automated and continuously optimized for accurate predictions.",
          )}
        </p>
      </div>
      <br />
        <a href="https://confluence.ecmwf.int/display/CKB/CAMS+solar+radiation+time-series%3A+data+documentation" target="_blank" className="text-blue-500"><strong>Data source:</strong> CAMS Solar Radiation Data Service.</a>
      {/* </div> */}
    </div>
  );
};

export const WindAboutDescription = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p>
        {t(
          "forecast.about.wind.intro",
          "Wind power production forecasts are provided with a two-day forecasting horizon. The forecasts are customized to each user's wind park characteristics based on the following options:",
        )}
      </p>

 <div className="space-y-1">
        <p className="font-medium">{t("forecast.about.wind.ml.title", "Tailor-made forecasts based on Historical Data")}</p>
        <p className="pl-6">{t("forecast.about.wind.ml.upload", "Users can upload historical power production data (in kW) alongside basic meteorological parameters and the wind turbine power curve model (if available) using our provided templates")}</p>
        <p className="pl-6">{t("forecast.about.wind.ml.training", "A model will be trained using this data, and then be inferenced using weather (DT) forecasts, to give precise 2-days wind power production forecasts. ")}</p>
      </div>
      
      <div className="space-y-1">
        <p className="font-medium">{t("forecast.about.wind.standard.title", "Standard Forecasting Without Historical Data")}</p>
        <p className="pl-6">{t("forecast.about.wind.standard.estimation", "In the absence of historical data for upload, an option is provided to estimate power based solely on a power curve model. Users can either provide their own curve using the available template or choose from two predefined models.")}</p>
        <p className="pl-6">{t("forecast.about.wind.standard.precision", "While slightly less precise, this option still delivers valuable insights for planning and decision-making.")}</p>
      </div>      
 
      <p className="font-medium">{t("forecast.about.wind.plans.title", "Our Forecasting Plans")}</p>
      
      <div className="space-y-1">
        <p className="font-medium"><span style={{ color: "#0067ca" }}>◆</span> {t("forecast.about.wind.plans.onetime.title", "One-Time Forecast")}</p>
        <p className="pl-6">{t("forecast.about.wind.plans.onetime.ideal", "Ideal for users who want to test our service before committing.")}</p>
        <p className="pl-6">{t("forecast.about.wind.plans.onetime.get", "Get a single-day forecast with precise insights for wind potential assessment.")}</p>
      </div>
      
      <div className="space-y-1">
        <p className="font-medium"><span style={{ color: "#0067ca" }}>◆</span> {t("forecast.about.wind.plans.annual.title", "Annual Subscription ")}</p>
        <p className="pl-6">{t("forecast.about.wind.plans.annual.receive", "Receive daily updated forecasts throughout the year.")}</p>
        <p className="pl-6">{t("forecast.about.wind.plans.annual.automated", "Fully automated and continuously optimized for accurate predictions.")}</p>
      </div>
    </div>
  );
};
