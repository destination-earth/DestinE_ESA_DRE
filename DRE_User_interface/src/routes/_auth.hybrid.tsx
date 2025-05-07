import { createFileRoute } from "@tanstack/react-router";
import Card from "../components/ui/Card";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { HYBRID_PLANTS_DATA } from "../services/mock/hybrid_plants_data";
import InputSelect from "../components/ui/InputSelect";
import { Plant } from "../models/Plant";
import HybridPlantComparisonChart from "../components/hybrid/HybridPlantComparisonChart";
import HybridModelPredictionChart from "../components/hybrid/HybridModelPredictionChart";
import HybridTable from "../components/hybrid/HybridTable";
import { faBox } from "@fortawesome/free-solid-svg-icons";
import { addDays, parse } from "date-fns";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { formatTableArray} from "../models/GetSolarDataResponseDust";
import { useApiClient } from "../hooks/useApiClient";
import { GetHybridDemoDataResponse } from "../models/GetHybridDataResponse";
import { dateOptionsHybridDemo } from "../services/mock/mock_settings";
import { ApexOptions } from "apexcharts";


const Hybrid = () => {
  const plants: Plant[] = HYBRID_PLANTS_DATA;
   const dateOptions = dateOptionsHybridDemo;

  const { t } = useTranslation();

  const [selectedPlant, setSelectedPlant] = useState<Plant | undefined>(
    plants[0],
  );
  const [selectedDateRange, setSelectedDateRange] = useState(dateOptions[0].value);
  const selectedDateOption = dateOptions.find(option => option.value === selectedDateRange);
   

  const { getHybridDemoData } = useApiClient();
  const [filteredPredictionData, setFilteredPredictionData] = useState<any[]>([]);
  
  const [filteredProductionData, setFilteredProductionData] = useState<any[]>([]);

  const [filteredComparisonData, setFilteredComparisonData] = useState<any[]>([]);

 
  const handleSelectedPlantChange = (id: string) => {
    const selectedPlant = plants.find((p) => p.id === id);
    setSelectedPlant(selectedPlant);
  };

 
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

    const filteredComparisonData = formatTableArray(currentData?.hybridComparison ?? [], 1).filter(record => {
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

  };


  const [data, setData] = useState<GetHybridDemoDataResponse>();


  //this used to display data at once!
    useEffect(() => {
      if (data) {
        handlePredictionChange(dateOptions[0].value, data);
      }
    }, [data]);


  const selectedPlantType = selectedPlant?.plantType.value;
  selectedPlantType?.toString();


  const options = plants.map((p) => ({
    value: p.id,
    name: p.name,
    icon: faBox,
    iconColor: "text-purple-400",
  }));

  const optionsApex: ApexOptions = {
    chart: {
      events: {
        mounted: (chart) => {
          chart.hideSeries("Wind Speed (m/s)");
          chart.hideSeries("Wind Direction (Deg)");
          chart.hideSeries("Temperature (°C)");
          chart.hideSeries("Solar Irradiation (kWh/m²)");
        },
      },
    },
  };



  useEffect(() => {
   

    const today = new Date();
    const next2Days = addDays(today, 2);

    const params = {
      asset: "-1",
      startDate: today.toISOString(),
      endDate: next2Days.toISOString(),
    };

    const fetchData = async () => {
      const response = await getHybridDemoData(params);
      setData(response?.data);       
    };

    fetchData();
  }, [getHybridDemoData]);


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

          <Card title={t("dashboard.hyrefModelPrediction")}>
            <HybridModelPredictionChart data={formatTableArray(filteredPredictionData,1)} opts={optionsApex} />
          </Card>
        </div>
      }
      secondRowLeft={
        <Card title={`${t("dashboard.powerOutput")} (${selectedDateOption?.syncLabel})`}> 
          <HybridTable data={formatTableArray(filteredProductionData,1)} />
        </Card>
      }
      secondRowRight={
        <Card title={`${t("dashboard.productionVSPrediction")} (${selectedDateOption?.syncLabel})`}> 
          <HybridPlantComparisonChart data={formatTableArray(filteredComparisonData,1)} />
        </Card>
      }

      thirdRow={null}
    ></DashboardLayout>
  );
};

export const Route = createFileRoute("/_auth/hybrid")({
  component: Hybrid,
});
