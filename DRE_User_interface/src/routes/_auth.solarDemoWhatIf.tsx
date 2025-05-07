import { createFileRoute } from "@tanstack/react-router";
import Card from "../components/ui/Card";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import InputSelect from "../components/ui/InputSelect";
import SolarModelWithDustPercentageChartDust from "../components/solar/SolarModelWithDustPercentageChartDust";
import SolarModelWithDustPredictionChartDust from "../components/solar/SolarModelWithDustPredictionChartDust";
import SolarModelWithDustPredictionChartDustAot from "../components/solar/SolarModelWithDustPredictionChartDustAot";
import { useApiClient } from "../hooks/useApiClient";
import {getEmptyDataTable ,getZeroFilledSolarDustPercentage, formatTableArray} from "../models/GetSolarDataResponseDust";



//import SolarTableDus
// t from "../components/solar/SolarTableDust";


import { faSun } from "@fortawesome/free-solid-svg-icons";
//import { api } from "../services/api/api";
//import { useAuth } from "../hooks/useAuth";
import { GetSolarDataResponseDust } from "../models/GetSolarDataResponseDust";
import { addDays } from "date-fns";
import WhatIfDashboardLayout from "../components/layouts/WhatIfDashboardLayout";
import DustFilter from "../components/solar/DustFilter";


const Solar = () => {
  const { t } = useTranslation();
  //const { initialSettings } = useAuth();
  const { initialSettings, getSolarDustData } = useApiClient();
  const { mainSites } = initialSettings ?? {};
  const plants = mainSites ?? [];

  const [dust, setDust] = useState<number>(0);
  
  const [selectedId, setSelectedId] = useState<string | undefined>(
    plants?.length ? plants[0].key : undefined,
  );

  const handleSelectedPlantChange = (key: string) => {

    setSelectedId(key)};

  const [data, setData] = useState<GetSolarDataResponseDust>();

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
      try {
        const response = await getSolarDustData(params);       
        setData(response?.data  );
      } catch (error) {
        
      }
    };

    fetchData();
  }, [getSolarDustData,selectedId]);

  const options = mainSites
    ?.filter((ms) => ms.type === "solar")
    .map((p) => ({
      value: p.key,
      name: p.value,
      icon: faSun,
      iconColor: "text-yellow-400",
    }));

  if (!initialSettings) return <>Loading..</>;

  
 
  
  const solarDustAOT = data?.solardustaot ?? [];
  const solarDustPercentage = data?.solardustpercentage ?? [];
  const solarDustTableSmall =  data?.solardusttablesmall ?? [];
  const solarDustTableMedium = data?.solardusttablemedium ?? [];
  const solarDustTableHigh = data?.solardusttablehigh?? [];
  const emptyData = getEmptyDataTable("2024-01-20T00:00:00Z", 10);
  const emptyDataPercentage = getZeroFilledSolarDustPercentage("2024-01-20T00:00:00Z", 10);
  
  //console.log(emptyData);
  

  return (    
    <WhatIfDashboardLayout
      firstRow={
        <div>
          <div className="mb-5 flex items-center gap-10">
            <div className="w-56">
              <InputSelect
                defaultValue={options?.[0]}
                label={t("plant.label")}
                options={options}
                onChange={(v) => handleSelectedPlantChange(v)}
              />
            </div>
            <div>
              <DustFilter onChange={(v) => setDust(v)} />
            </div>
          </div>
          <Card title="Forecasted Power Output (kW) with and without AOT correction across timesteps">
            <SolarModelWithDustPredictionChartDust data={formatTableArray(solarDustAOT,1)} dust={dust}/>
          </Card>
        </div>
      }
       
             //it is still the same and all visible, lets see hot to split them?
      secondRowLeft={ 
        <Card title="Reduction percentage for forecasted power output (kW)">
          {dust === 0 && <SolarModelWithDustPercentageChartDust data={emptyDataPercentage} dust={dust}/>  }
        {dust === 1 && <SolarModelWithDustPercentageChartDust data={formatTableArray(solarDustPercentage,1)} dust={dust}/>  }
        {dust === 2 && <SolarModelWithDustPercentageChartDust data={formatTableArray(solarDustPercentage,1)} dust={dust}/>}
        {dust === 3 && <SolarModelWithDustPercentageChartDust data={formatTableArray(solarDustPercentage,1)} dust={dust}/> }
      </Card>
      }
      
      secondRowRight ={
        <Card title="Dust AOT">
          {dust === 0 && <SolarModelWithDustPredictionChartDustAot data={emptyData} dust={dust}/> }
          {dust === 1 && <SolarModelWithDustPredictionChartDustAot data={formatTableArray(solarDustTableSmall,3)} dust={dust}/> }
          {dust === 2 && <SolarModelWithDustPredictionChartDustAot data={formatTableArray(solarDustTableMedium,3)} dust={dust}/>}
          {dust === 3 && <SolarModelWithDustPredictionChartDustAot data={formatTableArray(solarDustTableHigh,3)} dust={dust}/> }
        </Card>
      }

      thirdRow={
        <div></div>
        // <Card title={t("dashboard.keyPerformanceIndicators")}>
        //   <KPICharts data={kpis} />
        // </Card>
      }
    ></WhatIfDashboardLayout>
  );
};

export const Route = createFileRoute("/_auth/solarDemoWhatIf")({
  component: Solar,
});
 

