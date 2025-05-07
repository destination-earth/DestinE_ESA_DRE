import { createFileRoute } from "@tanstack/react-router";
import Card from "../components/ui/Card";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import InputSelect from "../components/ui/InputSelect";
import SolarPlantComparisonChart from "../components/solar/SolarPlantComparisonChart";
import SolarModelWithDustPredictionChart from "../components/solar/SolarModelWithDustPredictionChart";
import SolarTableDemo from "../components/solar/SolarTableDemo";
import { faSun } from "@fortawesome/free-solid-svg-icons";
import { GetSolarDataResponse } from "../models/GetSolarDataResponse";
import KPICharts from "../components/KPICharts";
import { addDays, parse, } from "date-fns";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { useApiClient } from "../hooks/useApiClient";
import { formatTableArray } from "../models/GetSolarDataResponseDust";
import { dateOptionsSolarDemo } from "../services/mock/mock_settings";




const Solar = () => {
  const { t } = useTranslation();
  const { initialSettings, getSensorData } = useApiClient();
  const { mainSites } = initialSettings ?? {};
  const plants = mainSites ?? [];

  const [selectedId, setSelectedId] = useState<string | undefined>(
    plants?.length ? plants[0].key : undefined,
  );

  const [data, setData] = useState<GetSolarDataResponse>();
  const [filteredPredictionData, setFilteredPredictionData] = useState<any[]>([]);
  
  const [filteredProductionData, setFilteredProductionData] = useState<any[]>([]);

  const [filteredComparisonData, setFilteredComparisonData] = useState<any[]>([]);

  const [KPIsFixedData, setKPIsFixedData] = useState<any[]>([]);


  const dateOptions = dateOptionsSolarDemo;


  const [selectedDateRange, setSelectedDateRange] = useState(dateOptions[0].value);
  const selectedDateOption = dateOptions.find(option => option.value === selectedDateRange);

  useEffect(() => {
    if (!selectedId) return;

    const today = new Date();
    const next2Days = addDays(today, 2);

    const params = {
      asset: selectedId,
      startDate: today.toISOString(),
      endDate: next2Days.toISOString(),
    };

    const fetchData = async () => {
      const response = await getSensorData(params);
      setData(response?.data);
      handlePredictionChange(selectedDateRange, response?.data);
    };

    fetchData();
  }, [getSensorData, selectedId]);

  const handleSelectedPlantChange = (key: string) => setSelectedId(key);

  const handlePredictionChange = (key: string, currentData = data) => {
    setSelectedDateRange(key);
    
    const [startStr, endStr] = key.split(" - ");
    var startDate = parse(startStr.trim(), "yyyy-MM-dd", new Date());
    var endDate = parse(endStr.trim(), "yyyy-MM-dd", new Date());




    const filteredData = formatTableArray(currentData?.predictionRecords ?? [], 1).filter(record => {
      const recordDate = new Date(record.datetime); 
      if  (recordDate<=endDate && recordDate>=startDate){
 
        return true;
      
      }else{
        return false;
      }
    });
    setFilteredPredictionData(filteredData);

     startDate = addDays(startDate, -2);
     endDate = addDays(endDate, -2);

     const filteredComparisonData = formatTableArray(currentData?.meterologicalData ?? [], 1).filter(record => {
      const recordDate = new Date(record.datetime); 
      if  (recordDate<=endDate && recordDate>=startDate){
 
        return true;
      
      }else{
        return false;
      }
    });
 
    setFilteredComparisonData(filteredComparisonData);

    
    const filteredProductionData = formatTableArray(currentData?.productionRecords ?? [], 1).filter(record => {
      const recordDate = new Date(record.datetime); 
      if  (recordDate<=endDate && recordDate>=startDate){
 
        return true;
      
      }else{
        return false;
      }
    });
    setFilteredProductionData(filteredProductionData);

    const fixKPIData = formatTableArray(currentData?.kpis ?? [], 1).map(record => ({
      ...record,
      value: (parseInt(record.value, 10)).toFixed(1), // Ensures proper number multiplication
    }));

    setKPIsFixedData(fixKPIData??[]);
  };


 

  const options = mainSites
    ?.filter((ms) => ms.type === "solar")
    .map((p) => ({
      value: p.key,
      name: p.value,
      icon: faSun,
      iconColor: "text-yellow-400",
    }));

  if (!data) return <>Loading..</>;

  return (
    <DashboardLayout
      firstRow={
        <div>
          <div className="mb-3 w-56 flex space-x-4">
            <div>
              <InputSelect
                defaultValue={options?.[0]}
                label={t("plant.label")}
                options={options}
                onChange={(v) => handleSelectedPlantChange(v)}
              />
            </div>
            <div>
              <InputSelect
                defaultValue={dateOptions?.[0]}
                label={t("plant.predictionDates")}
                options={dateOptions}
                onChange={(v) => handlePredictionChange(v)}
              />
            </div>
          </div>
         
 

        <Card title= {t("dashboard.hyrefModelPrediction")} >
            <SolarModelWithDustPredictionChart data={filteredPredictionData} />
          </Card>
        </div>
      }
      secondRowLeft={
        <Card title={`${t("dashboard.powerOutput")} (${selectedDateOption?.syncLabel})`}>
          <SolarTableDemo data={formatTableArray(filteredProductionData, 1)} />
        </Card>
      }
      secondRowRight={
        <Card title={`${t("dashboard.productionVSPrediction")} (${selectedDateOption?.syncLabel})`}> 
          <SolarPlantComparisonChart data={formatTableArray(filteredComparisonData, 1)} />
        </Card>
      }
 
      thirdRow={
        <Card title={`${t("dashboard.keyPerformanceIndicators")} ${selectedDateOption?.syncLabel}`}>
          <KPICharts data={KPIsFixedData} />
        </Card>
      }
    ></DashboardLayout>
  );
};

export const Route = createFileRoute("/_auth/solarDemo")({
  component: Solar,
});
