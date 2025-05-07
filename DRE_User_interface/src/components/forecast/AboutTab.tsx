import React from "react";
import Card from "../ui/Card";
import solarPanelsImage from "../../assets/solar-panels.png";
import windTurbinesImage from "../../assets/wind-turbines.png";
import {
  useSolarForecastAboutQuery,
  useWindForecastAboutQuery,
} from "../../hooks/useForecastQueries";
import ForecastTimeSeriesChart from "../forecast/ForecastTimeSeriesChart";
import ForecastPredictionComparisonChart from "../forecast/ForecastPredictionComparisonChart";
import WindPowerSpeedChart from "../forecast/WindPowerSpeedChart";
import WindActualVsPredictedChart from "../forecast/WindActualVsPredictedChart";
import { useTranslation } from "react-i18next";
import {
  SolarAboutDescription,
  WindAboutDescription,
} from "./text/ForecastAboutText";
import {
  TimeSeriesDataPoint,
  PredictionComparisonPoint,
  ForecastTimeDataPoint,
  RealVsForecastDataPoint,
} from "../../services/api/forecastTypes";

/**
 * Props for the AboutTab component
 */
interface AboutTabProps {
  energyType?: "solar" | "wind";
}

/**
 * AboutTab component displays information about the forecast service
 * @param param0 Component props
 * @returns React component
 */
const AboutTab = ({ energyType = "solar" }: AboutTabProps): React.ReactNode => {
  const { t } = useTranslation();

  // Always use solar as default if energyType is undefined or invalid
  const effectiveEnergyType =
    energyType === "solar" || energyType === "wind" ? energyType : "solar";

  // Fetch data based on energy type
  const { data: solarAboutData, isLoading: isLoadingSolarAbout } =
    useSolarForecastAboutQuery();

  const { data: windAboutData, isLoading: isLoadingWindAbout } =
    useWindForecastAboutQuery();

  // We don't need to reset queries when energy type changes
  // React Query's cache will handle this properly with the authentication dependencies
  // This was causing unnecessary refetching

  const getSectionTitle = () =>
    effectiveEnergyType === "solar"
      ? t("forecast.about.solar.title", "2-day Solar Energy Forecast")
      : t("forecast.about.wind.title", "2-day Wind Energy Forecast");

  const getSectionDescription = () => {
    if (effectiveEnergyType === "solar") {
      return <SolarAboutDescription />;
    } else {
      return <WindAboutDescription />;
    }
  };

  const getUseCaseTitle = () =>
    t("forecast.about.useCase.title", "Use Case Demonstration");

  const getUseCaseDescription = () =>
    effectiveEnergyType === "solar"
      ? t(
          "forecast.about.useCase.solar.description",
          "Explore how KINIGOS SA, a subsidiary of Quest Energy SA, utilizes our solar forecasting service to optimize the performance of its stations in Greece. This demonstration showcases our Solar Forecasting service can enhance decision-making and efficiency for large-scale solar parks.",
        )
      : t(
          "forecast.about.useCase.wind.description",
          "Explore how our service is implemented at a wind farm operated by MORE Energy in central Greece. This demonstration highlights how our Wind Power Forecasting service delivers site-specific forecasts, enhancing decision-making and operational efficiency.",
        );

  // Transform API data for charts
  const transformTimeSeriesData = (
    data: ForecastTimeDataPoint[],
  ): TimeSeriesDataPoint[] => {
    return data.map((item) => ({
      datetime: item.datetime,
      powerKw: item.power,
      irradiation: item.irradiation,
    }));
  };

  const transformPredictionComparisonData = (
    data: RealVsForecastDataPoint[],
  ): PredictionComparisonPoint[] => {
    return data.map((item) => ({
      step: item.step,
      datetime: item.datetime,
      actual: item.poweroutput,
      predicted: item.powerforecast,
    }));
  };

  // Get the appropriate data based on energy type
  const getTimeSeriesData = () => {
    if (effectiveEnergyType === "solar") {
      return {
        data: solarAboutData?.forcastvstime
          ? transformTimeSeriesData(solarAboutData.forcastvstime)
          : [],
        isLoading: isLoadingSolarAbout,
      };
    } else {
      return {
        data: windAboutData?.forcastvstime
          ? transformTimeSeriesData(windAboutData.forcastvstime)
          : [],
        isLoading: isLoadingWindAbout,
      };
    }
  };

  const getPredictionComparisonData = () => {
    if (effectiveEnergyType === "solar") {
      return {
        data: solarAboutData?.realvsforecast
          ? transformPredictionComparisonData(solarAboutData.realvsforecast)
          : [],
        isLoading: isLoadingSolarAbout,
      };
    } else {
      return {
        data: windAboutData?.realvsforecast
          ? transformPredictionComparisonData(windAboutData.realvsforecast)
          : [],
        isLoading: isLoadingWindAbout,
      };
    }
  };

  // Extract data for charts
  const timeSeriesChartData = getTimeSeriesData();
  const predictionComparisonChartData = getPredictionComparisonData();

  return (
    // Use key to force re-render when energy type changes
    <div className="space-y-8 pb-12" key={`about-tab-${effectiveEnergyType}`}>
      <Card>
        <div className="flex flex-col md:flex-row">
          <div className="mx-4 flex flex-1 flex-col justify-center py-6 pr-6">
            <h2 className="mb-4 text-3xl font-bold">{getSectionTitle()}</h2>
            <div className="text-lg text-gray-600">
              {getSectionDescription()}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="my-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <img
              src={
                effectiveEnergyType === "solar"
                  ? solarPanelsImage
                  : windTurbinesImage
              }
              alt={
                effectiveEnergyType === "solar"
                  ? t("forecast.about.image.solar.alt", "Solar panels")
                  : t("forecast.about.image.wind.alt", "Wind turbines")
              }
              className="h-64 w-full rounded-md object-cover"
            />
          </div>

          <div>
            <h3 className="mb-2 text-lg font-medium">{getUseCaseTitle()}</h3>
            <p className="text-gray-600">{getUseCaseDescription()}</p>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="mb-4 text-lg font-medium">
            {t(
              "forecast.about.chart.timeseries.title",
              "Power Production Forecast",
            )}
          </h3>
          <div className="h-80 rounded-md">
            {effectiveEnergyType === 'solar' ? (
              <ForecastTimeSeriesChart
                data={timeSeriesChartData.data}
                isLoading={timeSeriesChartData.isLoading}
                energyType={effectiveEnergyType}
              />
            ) : (
              <WindPowerSpeedChart
                isLoading={timeSeriesChartData.isLoading}
              />
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-4 text-lg font-medium">
            {t(
              "forecast.about.chart.comparison.title",
              "Actual vs. Predicted Power",
            )}
          </h3>
          <div className="h-80 rounded-md">
            {effectiveEnergyType === 'solar' ? (
              <ForecastPredictionComparisonChart
                data={predictionComparisonChartData.data}
                isLoading={predictionComparisonChartData.isLoading}
                energyType={effectiveEnergyType}
              />
            ) : (
              <WindActualVsPredictedChart
                isLoading={predictionComparisonChartData.isLoading}
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AboutTab;
