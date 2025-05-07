import { useTranslation } from "react-i18next";

// Calculate a date 2 days before today
const calculateLatestDate = (): string => {
  const today = new Date();
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  
  // Format as DD/MM/YYYY
  const day = String(twoDaysAgo.getDate()).padStart(2, '0');
  const month = String(twoDaysAgo.getMonth() + 1).padStart(2, '0');
  const year = twoDaysAgo.getFullYear();
  
  return `${day}/${month}/${year}`;
};

const latestDate = calculateLatestDate();

export const SolarAboutDescription = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p>
        {t(
          "forecast.about.solar.intro",
          "Our service provides two levels of solar data insights:",
        )}
      </p>

      <div className="space-y-1">
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t("forecast.about.solar.plans.onetime.title", "Basic Assessment")}
        </p>
        <p className="pl-6">
          {t(
            "forecast.about.solar.plans.onetime.about_basic",
            `Visualize and download monthly average values of Global Horizontal Irradiance (GHI) and Direct Normal Irradiance (DNI) for any location and dates ranging from 01/02/2004 to 2 days ago (${latestDate}).`,
          )}
        </p>
        <p className="pl-6">
          {t(
            "forecast.about.solar.plans.onetime.get",
            "This tool helps users analyze solar resource availability at no cost.",
          )}
        </p>
      </div>

      <div className="space-y-1">
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t("forecast.about.solar.plans.annual.title", "Premium Assessment")}
        </p>
        <p className="pl-6">
          {t(
            "forecast.about.solar.plans.annual.receive",
            "Extending the Basic Assessment, the Premium Assessment adds power production estimation based on your solar park's specifications, including panel tilt, azimuth, tracking type (fixed, single-axis, or dual-axis), and capacity.",
          )}
        </p>
        <p className="pl-6">
          {t(
            "forecast.about.solar.plans.annual.automated",
            "Fully automated and continuously optimized for accurate predictions.",
          )}
        </p>
        <br />
        <a href="https://confluence.ecmwf.int/display/CKB/CAMS+solar+radiation+time-series%3A+data+documentation" target="_blank" className="text-blue-500"><strong>Data source:</strong> CAMS Solar Radiation Data Service.</a>
      </div>
    </div>
  );
};

export const SolarAboutUsecase = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p>
        {t(
          "forecast.about.solar.intro",
          "Explore how KINIGOS SA, a subsidiary of Quest Energy SA, utilizes our solar forecasting service to optimize the performance of its stations in Greece. This demonstration showcases our Solar Energy Assessment service can enhance decision-making and efficiency for large-scale solar parks.",
        )}
      </p>
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
          "Explore how our wind resource assessment tool enhances site selection and energy potential analysis for wind energy projects. This demonstration showcases how our service empowers developers and end-users with data-driven insights, optimizing efficiency and maximizing returns for large-scale wind farms.",
        )}
      </p>

      <div className="space-y-1">
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t("forecast.about.wind.plans.onetime.title", "Basic Service (A1)")}
        </p>
        <p className="pl-6">
          {t(
            "forecast.about.wind.plans.onetime.ideal",
            "Provides basic wind resource assessment analysis and data for a selected location and period.",
          )}
        </p>
        <p className="pl-6">
          {t(
            "forecast.about.wind.plans.onetime.get",
            "These data are essential for site selection, feasibility studies, energy yield assessments and turbine layout optimization.",
          )}
        </p>
      </div>

      <div className="space-y-1">
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t("forecast.about.wind.plans.annual.title", "Premium Service (B1)")}
        </p>
        <p className="pl-6">
          {t(
            "forecast.about.wind.plans.annual.receive",
            "Includes all Basic Service features plus turbine-specific energy yield estimation using your wind turbine configuration",
          )}
        </p>
        <p className="pl-6">
          {t(
            "forecast.about.wind.plans.annual.automated",
            "This service quantifies your site’s  potential production by modeling turbine-specific energy yield.",
          )}
        </p>
      </div>
    </div>
  );
};
export const WindAboutUsecase = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p>
        {t(
          "forecast.about.wind.intro",
          "Explore how our wind resource assessment tool enhances site selection and energy potential analysis for wind energy projects. This demonstration showcases how our service empowers developers and end-users with data-driven insights, optimizing efficiency and maximizing returns for large-scale wind farms.",
        )}
      </p>
    </div>
  );
};

export const WindBasicDescription = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p>
        {t(
          "forecast.about.wind.basic.histogram",
          "The wind speed histogram (cyan bars) illustrates how frequently different wind speeds occur at a given location over a defined time period. This visualization helps assess wind resource availability by showing the distribution of wind speeds—regardless of direction—highlighting which speeds are most common and how variable the wind is across the dataset."
        )}
      </p>
      <p>
        {t(
          "forecast.about.wind.basic.weibull_intro",
          "Overlaying the histogram, the Weibull distribution (red curve) provides a smooth, statistical fit to the wind speed data. It simplifies the complexity of wind patterns using just two parameters:"
        )}
      </p>
      <div className="space-y-1 pl-6">
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t(
            "forecast.about.wind.basic.weibull_shape",
            "Shape (k), which describes the spread or consistency of wind speeds—higher values mean more uniform wind conditions;"
          )}
        </p>
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t(
            "forecast.about.wind.basic.weibull_scale",
            "Scale (c), which correlates to the average wind speed at the site."
          )}
        </p>
      </div>
      <p>
        {t(
          "forecast.about.wind.basic.weibull_usage",
          "This distribution is widely used in wind energy studies because it offers a realistic representation of wind behavior, supporting both site assessment and turbine performance modeling."
        )}
      </p>
      <p>
        {t(
          "forecast.about.wind.basic.windrose",
          "Regarding the wind rose, it shows how often wind blows from each direction at a location over time. Bar lengths represent wind frequency by direction—longer bars mean more frequent winds. Colors indicate wind speed ranges, with lighter tones for gentler winds and darker shades for stronger ones. It’s a useful tool for visualizing prevailing wind patterns and supporting turbine alignment and site design."
        )}
      </p>
      <p>
        {t(
          "forecast.about.wind.basic.directional_intro",
          "In addition to the visual tools, directional statistics provide detailed insight into wind characteristics by direction. These outputs include:"
        )}
      </p>
      <div className="space-y-1 pl-6">
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t(
            "forecast.about.wind.basic.directional_direction",
            "Direction: Indicates where the wind is coming from (e.g., N, NE, E)."
          )}
        </p>
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t(
            "forecast.about.wind.basic.directional_frequency",
            "Frequency (%): Shows how often the wind blows from each direction."
          )}
        </p>
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t(
            "forecast.about.wind.basic.directional_weibull_shape",
            "Weibull Shape (k): Describes how consistent wind speeds are—higher values mean narrower variability."
          )}
        </p>
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t(
            "forecast.about.wind.basic.directional_weibull_scale",
            "Weibull Scale (c): Represents the typical wind speed, closely linked to the mean windiness of that direction."
          )}
        </p>
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t(
            "forecast.about.wind.basic.directional_mean_speed",
            "Mean Wind Speed (m/s): The average speed of wind coming from a specific direction."
          )}
        </p>
      </div>
      <p>
        {t(
          "forecast.about.wind.basic.high_wind",
          "High-wind indicators, like the 95th, 97th, and 99th percentiles, highlight how strong winds can occasionally get. These values are key for assessing rare but significant events, informing turbine resilience, and guiding structural design."
        )}
      </p>
    </div>
  );
};

export const WindPremiumDescription = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p>
        {t(
          "forecast.about.wind.premium.intro",
          "Explore how our wind resource assessment tool enhances site selection and energy potential analysis for wind energy projects. This demonstration showcases how our service empowers developers and end-users with data-driven insights, optimizing efficiency and maximizing returns for large-scale wind farms."
        )}
      </p>
      <p>
        {t(
          "forecast.about.wind.premium.power_outputs_intro",
          "In addition to the basic analysis, specific power-related outputs are provided here. When assessing the power production potential of a wind turbine, several key metrics provide insight into both the quality of the wind resource and the expected energy yield:"
        )}
      </p>
      {/* Metrics List */}
      <div className="space-y-1 pl-6">
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t(
            "forecast.about.wind.premium.metric_total_energy",
            "Total Energy Potential (kWh): Reflects the cumulative energy a turbine is projected to generate over the analysis period, based on observed wind conditions and the turbine’s specific power curve."
          )}
        </p>
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t(
            "forecast.about.wind.premium.metric_avg_power",
            "Average Power Output (kW): Represents the mean rate of energy production during the same period, calculated by dividing the total energy by the number of hours analyzed."
          )}
        </p>
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t(
            "forecast.about.wind.premium.metric_capacity_factor",
            "Capacity Factor: Expresses the ratio of actual energy produced to the maximum possible output if the turbine operated at full capacity around the clock. A higher capacity factor indicates a more productive and economically viable site."
          )}
        </p>
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t(
            "forecast.about.wind.premium.metric_mean_speed",
            "Mean Wind Speed (m/s): Offers a general measure of how windy the location is on average, serving as a fundamental parameter for estimating energy output."
          )}
        </p>
        <p className="font-medium">
          <span style={{ color: "#0067ca" }}>◆</span>{" "}
          {t(
            "forecast.about.wind.premium.metric_power_density",
            "Wind Power Density (W/m²): Quantifies the amount of kinetic energy available in the wind per unit area, factoring in both wind speed and air density. This metric is crucial for comparing site suitability and estimating how much power can be harvested per square meter of rotor swept area."
          )}
        </p>
      </div>
      <p>
        {t(
          "forecast.about.wind.premium.metrics_conclusion",
          "Together, these metrics form the core of a robust wind power assessment—guiding decisions on site selection, turbine sizing, and long-term energy forecasting."
        )}
      </p>
      <p>
        {t(
          "forecast.about.wind.premium.histogram_desc",
          "The wind speed histogram (cyan bars) illustrates how frequently different wind speeds occur at a given location over a defined time period."
        )}
      </p>
      <p>
        {t(
          "forecast.about.wind.premium.weibull_desc",
          "Overlaying the histogram, the Weibull distribution (red curve) provides a smooth, statistical fit to the wind speed data."
        )}
      </p>
      <p>
        {t(
          "forecast.about.wind.premium.energy_lines_desc",
          "Additionally, the horizontal blue lines represent the mean annual energy production associated with each wind speed bin, calculated using a standard wind power curve. These lines demonstrate how energy output depends not only on the intensity of the wind but also on how frequently that wind speed occurs. The result is a clear peak in energy production where optimal wind speeds align with high frequency—offering valuable insight into the most productive ranges for power generation."
        )}
      </p>
    </div>
  );
};

export const SolarBasicDescription = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p>
        {t(
          "forecast.about.solar.basic.intro",
          "The Basic Assessment clearly visualizes the average monthly cumulative solar irradiance, with orange bars representing Global Horizontal Irradiance (GHI) and blue bars indicating Direct Normal Irradiance (DNI), both measured in kilowatt-hours persquare meter (kWh/m2). GHI quantifies the total solar radiation received horizontally, reflecting overall solar potential at a specific location, whereas DNI measures the solar radiation directly coming from the sun's disk, crucial for concentrated solar applications and optimal panel alignment."
        )}
      </p>
    </div>
  );
};

export const SolarPremiumDescription = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p>
        {t(
          "forecast.about.solar.premium.intro",
          "The Premium Assessment extends the functionality by providing forecasts of PV power output (measured in kilowatt-hours, kWh) for the same period, translating irradiance data into practical energy generation estimates. This premium service enables more precise planning, robust financial analyses, and effective energy management strategies, helping users maximize the economic and environmental benefits of their PV installations."
        )}
      </p>
    </div>
  );
};