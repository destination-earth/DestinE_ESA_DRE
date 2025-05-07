import { useTranslation } from "react-i18next";

export const SolarTrainingDescription = () => {
  const { t } = useTranslation();
  return (
    <>
      <p>
        {t(
          "forecast.oneOff.solarDescription",
          "In order for a machine learning model tailored to the user's specific park's historical data to be trained, the user needs to upload their solar park data using our CSV template. This data enables the system to develop a customized prediction model based on the unique conditions of the site.",
        )}
        {/* <span className="font-bold">
          {t("forecast.annual.infoBox.bold", " required. ")}
        </span> */}
      </p>
      <p className="font-bold">
        {t(
          "forecast.oneOff.solarDescription2",
          "Please use the provided csv template.",
        )}
      </p>
    </>
  );
};

export const WindTrainingDescription = () => {
  const { t } = useTranslation();
  return (
    <>
      <p>
        {t(
          "forecast.oneOff.windDescription",
          "Please provide key details about your wind park: its precise location (latitude, longitude), hub height, power curve and capacity (in KW).To create a forecast model customized to your park’s unique characteristics, you need to upload your own historical wind park data and either upload your power curve using our CSV template, or choose from one of our two predefined power curves. With these inputs, our Digital Twin system refines wind energy predictions, helping you maximize efficiency and performance.",
        )}
        {/* <span className="font-bold">
          {t("forecast.annual.infoBox.bold", " required. ")}
        </span> */}
      </p>
      <p className="font-bold">
        {t(
          "forecast.oneOff.windDescription2",
          "Please use the provided csv template.",
        )}
      </p>
    </>
  );
};

export const SolarSpecsDescription = () => {
  const { t } = useTranslation();
  return (
    <>
      <p>
        {t(
          "forecast.oneOff.windDescription",
          "Please provide key details about your solar park: its precise location (latitude, longitude, altitude), panel tilt and azimuth angles, and whether your system includes tracking (fixed, single-axis, or dual-axis tracking). Additionally, specify your DC capacity (in watts) to ensure accurate modeling. With these inputs, our Digital Twin system refines solar energy predictions, helping you maximize efficiency and performance.",
        )}
        {/* <span className="font-bold">
          {t("forecast.annual.infoBox.bold", " required. ")}
        </span> */}
      </p>
      {/* <p className="font-bold">
        {t(
          "forecast.oneOff.windDescription2",
          "Please use the provided csv template.",
        )}
      </p> */}
    </>
  );
};

export const WindSpecsDescription = () => {
  const { t } = useTranslation();
  return (
    <>
      <p>
        {t(
          "forecast.oneOff.windDescription",
          "Explore how our service is implemented at a wind farm operated by MORE Energy in central Greece. This demonstration highlights how our Wind Power Forecasting service delivers site-specific forecasts, enhancing decision-making and operational efficiency",
        )}
        {/* <span className="font-bold">
          {t("forecast.annual.infoBox.bold", " required. ")}
        </span> */}
      </p>
      <p className="font-bold">
        {t(
          "forecast.oneOff.windDescription2",
          "Please use the provided csv template.",
        )}
      </p>
    </>
  );
};

export const SolarOneoffNote = () => {
  const { t } = useTranslation();
  return (
    <>
      <p>
        {t("forecast.annual.infoBox.description", "Solar park data are")}
        <span className="font-bold">
          {t("forecast.annual.infoBox.bold", " required. ")}
        </span>
        {t(
          "forecast.annual.infoBox.description",
          "Please use the provided csv template.",
        )}
      </p>
    </>
  );
};

export const WindOneoffNote = () => {
  const { t } = useTranslation();
  return (
    <>
      <p>
        {t("forecast.annual.infoBox.description", "Wind farm data are")}
        <span className="font-bold">
          {t("forecast.annual.infoBox.bold", " required. ")}
        </span>
        {t(
          "forecast.annual.infoBox.description",
          "Please use the provided csv template.",
        )}
      </p>
    </>
  );
};

export const WindTrainDataTemplateDescription = () =>{
  return (
    <p>
      To generate accurate 2-day wind energy production forecasts, we invite you to upload your wind park data using our CSV template. This data allows our system to train a tailored prediction model based on your specific site conditions. Download the template below to get started! Before uploading your file, please ensure it meets all validation requirements. The file must be in CSV format and contain case-sensitive names and must match the template. The time (in utc) column must follow the ISO 8601 format (e.g., 2023-06-01T08:00:00Z or 2023-06-01 08:00:00), with time intervals exactly every hour, no duplicate timestamps, and no future timestamps beyond three days ago. The column corresponding to power (in kW) must contain only numerical values (floats) between 0 and 18.000. The file must not include any empty cells or text values in numeric fields. If any rule is violated, the entire file will be rejected. You will receive an error report indicating the row number and the type of issue, so you can correct the file and re-upload it.
 
    </p>
  )
};

export const PowerCurveDescription = () => {
  return (
    <p>
      To accurately estimate wind power generation, please upload your turbine's power curve data. The CSV file must contain exactly two columns with the following case-sensitive names: <strong>wind_speed_in_m_s</strong> and <strong>power_output_in_kW</strong>. This data enables our system to calculate precise power output based on wind conditions at your selected location. Use our template below for the correct format.
    </p>
  )
}
