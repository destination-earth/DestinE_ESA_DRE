import { useTranslation } from "react-i18next";

export const SolarTrainDescription = () => {
  const { t } = useTranslation();
  return (
    <>
      <p>
        {t(
          "forecast.annual.solarTrainDescription",
          "Train a machine learning model for your solar park using historical data. This annual subscription service provides ongoing forecasts based on your specific site conditions.",
        )}
      </p>
      <p className="font-bold">
        {t(
          "forecast.annual.solarTrainDescription2",
          "Please use the provided csv template for training data.",
        )}
      </p>
    </>
  );
};

export const WindTrainDescription = () => {
  const { t } = useTranslation();
  return (
    <>
      <p>
        {t(
          "forecast.annual.windTrainDescription",
          "Please provide key details about your wind park: its precise location (latitude, longitude), hub height, power curve and capacity (in KW). To create a forecast model customized to your park’s unique characteristics, you need to upload your own historical wind park data and either upload  your power curve using our CSV template, or choose from one of our two predefined power curves.",
        )}
      </p><br/>
      <p>
        {t(
          "forecast.annual.windTrainDescription1",
          "This annual subscription service provides ongoing forecasts based on your specific site conditions, helping you maximize efficiency and performance",
        )}
      </p>
      <p className="font-bold"><strong>
        {t(
          "forecast.annual.windTrainDescription2",
          "Please use the provided csv template for training data.",
        )}
        </strong>
      </p>
    </>
  );
};

export const SolarStandardDescription = () => {
  const { t } = useTranslation();
  return (
    <>
      <p>
        {t(
          "forecast.annual.solarStandardDescription",
          "Please provide key details about your solar park: its precise location (latitude, longitude, altitude), panel tilt and azimuth angles, and whether your system includes tracking (fixed, single-axis, or dual-axis tracking). Additionally, specify your DC capacity (in watts) to ensure accurate modeling. With these inputs, our Digital Twin system refines solar energy predictions, helping you maximize efficiency and performance.",
        )}
      </p>
    </>
  );
};

export const WindStandardDescription = () => {
  const { t } = useTranslation();
  return (
    <>
          <p>
        {t(
          "forecast.annual.windTrainDescription",
          "Explore how our service is implemented at a wind farm operated by MORE Energy in central Greece. This demonstration highlights how our Wind Power Forecasting service delivers site-specific forecasts, enhancing decision-making and operational efficiency.",
        )}
      </p><br/>
      <p>
        {t(
          "forecast.annual.windStandardDescription",
          "Generate annual wind forecasts using standard specifications for your wind farm. This subscription provides forecasts based on the parameters you specify.",
        )}
      </p>
    </>
  );
};

export const AnnualForecastInfoBox = () => {
  const { t } = useTranslation();
  return (
    <>
      <p>
        {t(
          "forecast.annual.infoBox",
          "The model will be trained once based on your input. If you wish to apply a different set of parameters later on, a new annual subscription will be required."
        )}
      </p>
      <p>
        <strong>
          {t(
            "forecast.annual.infoBox2",
            "We recommend taking the time to carefully prepare your template and select the appropriate parameters to ensure the best results.",
          )}{" "}
        </strong>
      </p>
    </>
  );
};

export const WindAnnualTemplateDescription = () => {
  const { t } = useTranslation();
  return(
    <>
    <p>{t(
      "forecast.annual.infoBox",
      "To generate accurate 2-day wind energy production forecasts, we invite you to upload your wind park data using our CSV template. This data allows our system to train a tailored prediction model based on your specific site conditions. Download the template below to get started!Before uploading your file, please ensure it meets all validation requirements. The file must be in CSV format and contain exactly two columns with the following case-sensitive names: time_utc and total_production_active_power_kW. The time_utc column must follow the ISO 8601 format (e.g., 2023-06-01T08:00:00Z or 2023-06-01 08:00:00), with time intervals exactly every hour, no duplicate timestamps, and no future timestamps beyond three days ago. The total_production_active_power_kW column must contain only numerical values (floats) between 0 and 18.000. The file must not include any empty cells or text values in numeric fields."
    )}</p>
    <p><strong>{t(
      "forecast.annual.infoBox2",
      "If any of these rules are violated, the entire file will be rejected. You will receive an error report indicating the row number and the type of issue, so you can correct the file and re-upload it."
    )}</strong></p>
    </>
  )
}
