import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ForecastTimeSeriesChart from './ForecastTimeSeriesChart';
import ForecastPredictionComparisonChart from './ForecastPredictionComparisonChart';
import WindPowerSpeedChart from './WindPowerSpeedChart';
import WindActualVsPredictedChart from './WindActualVsPredictedChart';
import { 
  TimeSeriesDataPoint, 
  PredictionComparisonPoint,
  ForecastTimeDataPoint,
  RealVsForecastDataPoint
} from '../../services/api/forecastTypes';
import {
  useSolarForecastAboutQuery,
  useWindForecastAboutQuery,
} from "../../hooks/useForecastQueries";

interface ForecastVisualizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  energyType?: 'solar' | 'wind';
}

const ForecastVisualizationModal: React.FC<ForecastVisualizationModalProps> = ({
  isOpen,
  onClose,
  orderId,
  energyType = 'solar' // Default to solar if not specified
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>([]);
  const [comparisonData, setComparisonData] = useState<PredictionComparisonPoint[]>([]);

  // Fetch data using the same hooks as AboutTab
  const { data: solarAboutData, isLoading: isLoadingSolarAbout } = useSolarForecastAboutQuery();
  const { data: windAboutData, isLoading: isLoadingWindAbout } = useWindForecastAboutQuery();

  // Transform API data for charts (same as AboutTab)
  const transformTimeSeriesData = useCallback((data: ForecastTimeDataPoint[]): TimeSeriesDataPoint[] => {
    return data.map((item) => ({
      datetime: item.datetime,
      power: item.power,
      irradiation: item.irradiation,
    }));
  }, []);

  const transformPredictionComparisonData = useCallback((data: RealVsForecastDataPoint[]): PredictionComparisonPoint[] => {
    return data.map((item) => ({
      step: item.step,
      datetime: item.datetime,
      actual: item.poweroutput,
      predicted: item.powerforecast,
    }));
  }, []);

  // Load data from API when modal opens
  useEffect(() => {
    if (isOpen && orderId) {
      setIsLoading(true);
      setError(null);
      
      try {
        if (energyType === 'solar') {
          if (solarAboutData) {
            setTimeSeriesData(
              solarAboutData.forcastvstime 
                ? transformTimeSeriesData(solarAboutData.forcastvstime) 
                : []
            );
            setComparisonData(
              solarAboutData.realvsforecast 
                ? transformPredictionComparisonData(solarAboutData.realvsforecast) 
                : []
            );
          }
          setIsLoading(isLoadingSolarAbout);
        } else {
          // For wind, the data is directly used from the components
          setIsLoading(isLoadingWindAbout);
        }
      } catch (err) {
        console.error('Error processing forecast data:', err);
        setError('Failed to process forecast data. Please try again.');
      }
    }
  }, [
    isOpen, 
    orderId, 
    energyType, 
    solarAboutData, 
    windAboutData, 
    isLoadingSolarAbout, 
    isLoadingWindAbout,
    transformTimeSeriesData,
    transformPredictionComparisonData
  ]);

  // Reset data when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeSeriesData([]);
      setComparisonData([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative h-[90vh] w-[90vw] max-w-6xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        {/* Modal header */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
          <h3 className="text-xl font-semibold">
            {energyType === 'wind' 
              ? t('forecast.visualization.windTitle', 'Wind Energy Forecast')
              : t('forecast.visualization.solarTitle', 'Solar Energy Forecast')}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal content */}
        <div className="mb-6 space-y-8">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
              <span className="ml-2">{t('forecast.visualization.loading', 'Loading forecast data...')}</span>
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center text-red-500">
                <svg className="mx-auto mb-2 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          ) : (
            <>
              {energyType === 'wind' ? (
                // Wind Energy Charts
                <>
                  {/* Wind Power and Speed Chart */}
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="mb-4 text-center text-lg font-medium">
                      {t('forecast.visualization.windPowerSpeedChart', 'Wind Power and Speed')}
                    </h4>
                    <div className="h-[400px]">
                      <WindPowerSpeedChart 
                        isLoading={isLoading}
                      />
                    </div>
                  </div>
                  
                  {/* Wind Actual vs Predicted Chart */}
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="mb-4 text-center text-lg font-medium">
                      {t('forecast.visualization.windComparisonChart', 'Actual vs Predicted Wind Production')}
                    </h4>
                    <div className="h-[400px]">
                      <WindActualVsPredictedChart 
                        isLoading={isLoading}
                      />
                    </div>
                  </div>
                </>
              ) : (
                // Solar Energy Charts (default)
                <>
                  {/* Time Series Chart */}
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="mb-4 text-center text-lg font-medium">
                      {t('forecast.visualization.solarProductionChart', 'Solar Production Forecast')}
                    </h4>
                    <div className="h-[400px]">
                      <ForecastTimeSeriesChart 
                        data={timeSeriesData}
                        isLoading={isLoading}
                        energyType="solar"
                      />
                    </div>
                  </div>
                  
                  {/* Prediction Comparison Chart */}
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h4 className="mb-4 text-center text-lg font-medium">
                      {t('forecast.visualization.solarComparisonChart', 'Actual vs Predicted Solar Production')}
                    </h4>
                    <div className="h-[400px]">
                      <ForecastPredictionComparisonChart 
                        data={comparisonData}
                        isLoading={isLoading}
                        energyType="solar"
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* <div className="mt-4 text-sm text-gray-500">
          <p className="flex items-center font-extrabold text-lg">
            {t('forecast.visualization.downloadDataTip', '*You can click the hamburger menu: ')}
            <svg 
              className="mr-2 h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            {t('forecast.visualization.downloadDataTip', 'at the top right of each chart to download the data')}
          </p>
        </div> */}
        
        {/* Modal footer */}
        <div className="flex justify-end border-t border-gray-200 pt-3">
          <button
            onClick={onClose}
            className="rounded bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
          >
            {t('forecast.visualization.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForecastVisualizationModal;
