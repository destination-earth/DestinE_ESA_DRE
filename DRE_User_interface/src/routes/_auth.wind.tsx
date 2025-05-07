import { createFileRoute } from "@tanstack/react-router"; 
import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import { useTranslation } from "react-i18next";
import { WIND_PLANTS_DATA } from "../services/mock/wind_plants_data";
import InputSelect from "../components/ui/InputSelect";
import { Plant } from "../models/Plant";
import { addDays, parse } from "date-fns";
import WindPlantComparisonChart from "../components/wind/WindPlantComparisonChart";
import WindModelPredictionChart from "../components/wind/WindModelPredictionChart";
import WindTable from "../components/wind/WindTable";
import { faWind } from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "../components/layouts/DashboardLayout";
import KPICharts from "../components/KPICharts";
import { formatTableArray} from "../models/GetSolarDataResponseDust";
import { useApiClient } from "../hooks/useApiClient";
import { GetWindDemoDataResponse } from "../models/GetWindDataResponse";
import { dateOptionsWindDemo } from "../services/mock/mock_settings";


const Wind = () => {
  const plants: Plant[] = WIND_PLANTS_DATA;
 
  const { getWindDemoData } = useApiClient();
 
  const dateOptions = dateOptionsWindDemo;

  const [selectedDateRange, setSelectedDateRange] = useState(dateOptions[0].value);
  const selectedDateOption = dateOptions.find(option => option.value === selectedDateRange);
   
  const [data, setData] = useState<GetWindDemoDataResponse>();
  const [filteredPredictionData, setFilteredPredictionData] = useState<any[]>([]);
  
  const [filteredProductionData, setFilteredProductionData] = useState<any[]>([]);

  const [filteredComparisonData, setFilteredComparisonData] = useState<any[]>([]);

  const [KPIsFixedData, setKPIsFixedData] = useState<any[]>([]);


  const { t } = useTranslation();

  const [selectedPlant, setSelectedPlant] = useState<Plant | undefined>(
    plants[0],
  );

  const handleSelectedPlantChange = (id: string) => {
    const selectedPlant = plants.find((p) => p.id === id);
    setSelectedPlant(selectedPlant);
  };

  useEffect(() => {
    if (data) {
      // Use the default date option value when data is loaded
      handlePredictionChange(dateOptions[0].value, data);
    }
  }, [data]);


  const handlePredictionChange = (key: string, currentData = data) => {
    setSelectedDateRange(key);
    
    const [startStr, endStr] = key.split(" - ");
    var startDate = parse(startStr.trim(), "yyyy-MM-dd", new Date());
    var endDate = parse(endStr.trim(), "yyyy-MM-dd", new Date());


    const filteredData = formatTableArray(currentData?.forecastData ?? [], 1).filter(record => {
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
    
    const filteredComparisonData = formatTableArray(currentData?.windComparison ?? [], 1).filter(record => {
      const recordDate = new Date(record.datetime); 
      if  (recordDate<=endDate && recordDate>=startDate){
 
        return true;
      
      }else{
        return false;
      }
    });
    setFilteredComparisonData(filteredComparisonData);




    
    const filteredProductionData = formatTableArray(currentData?.outputData ?? [], 1).filter(record => {
      const recordDate = new Date(record.datetime); 
      if  (recordDate<=endDate && recordDate>=startDate){
 
        return true;
      
      }else{
        return false;
      }
    });
    setFilteredProductionData(filteredProductionData);

    const fixKPIData = (currentData?.kpis ?? []).map(record => ({
      ...record,
      value: (parseInt(record.value, 10)), // Ensures proper number multiplication
    }));

    setKPIsFixedData(fixKPIData??[]);
  };






  const selectedPlantType = selectedPlant?.plantType.value;
  

  selectedPlantType?.toString();

  const options = plants.map((p) => ({
    value: p.id,
    name: p.name,
    icon: faWind,
    iconColor: "text-blue-400",
  }));



useEffect(() => {
   

    const today = new Date();
    const next2Days = addDays(today, 2);

    const params = {
      asset: "-1",
      startDate: today.toISOString(),
      endDate: next2Days.toISOString(),
    };

    const fetchData = async () => {
      const response = await getWindDemoData(params);
      setData(response?.data);

      //console.log(response);
      
    };

    fetchData();
  }, [getWindDemoData]);

  if (!data) return <>Loading..</>;

  return (
    <DashboardLayout
      firstRow={
        <div>
             <div className="mb-3 w-56 flex space-x-4"> 
              <div>
              <InputSelect
                defaultValue={options[0]}
                label={t("plant.label")}
                options={options}
                onChange={(v) => handleSelectedPlantChange(v)}/>
            </div>
            <div>
              <InputSelect
                defaultValue={dateOptions?.[0]}
                label={t("plant.predictionDates")}
                options={dateOptions}
                onChange={(v) => handlePredictionChange(v)}/>
            </div>
          </div>



          <Card title={t("dashboard.hyrefModelPrediction")}>
            <div className="mb-5 flex justify-center"></div>
            <WindModelPredictionChart data={formatTableArray(filteredPredictionData!,1)} />
          </Card>
        </div>


      }
      secondRowLeft={        
      <Card title={`${t("dashboard.powerOutput")} (${selectedDateOption?.syncLabel})`}>
          <WindTable data={formatTableArray(filteredProductionData,1)} />
        </Card>
      }
      
      secondRowRight={
        <Card title={`${t("dashboard.productionVSPrediction")} (${selectedDateOption?.syncLabel})`}> 
          <WindPlantComparisonChart data={formatTableArray(filteredComparisonData,1)} />
        </Card>
      }
      thirdRow={
        <Card title={`${t("dashboard.keyPerformanceIndicators")} ${selectedDateOption?.syncLabel}`}>
          <KPICharts data={KPIsFixedData}/>
        </Card>
      }
    ></DashboardLayout>
  );
};

export const Route = createFileRoute("/_auth/wind")({
  component: Wind,
});
