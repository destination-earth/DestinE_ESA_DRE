import { createFileRoute } from "@tanstack/react-router";
import Card from "../components/ui/Card";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import SolarModelWithDustPredictionChart from "../components/solar/SolarModelWithDustPredictionChart";
import { GetSolarDataResponse } from "../models/GetSolarDataResponse";
import { addDays } from "date-fns";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { GetDataParams } from "../models/GetDataParams";
import { useApiClient } from "../hooks/useApiClient";

const Solar = () => {
  const { t } = useTranslation();

  const { getSensorData, initialSettings } = useApiClient();
  const { mainSites } = initialSettings ?? {};
  const plants = mainSites ?? [];

  //const [selectedId, setSelectedId] = useState<string | undefined>(
  const [selectedId] = useState<string | undefined>(
    plants?.length ? plants[0].key : undefined,
  );

  //const handleSelectedPlantChange = (key: string) => setSelectedId(key);

  const [data, setData] = useState<GetSolarDataResponse>();

  useEffect(() => {
    if (!selectedId) return;

    const today = new Date();
    const next2Days = addDays(today, 2);

    const params: GetDataParams = {
      asset: selectedId,
      startDate: today.toISOString(),
      endDate: next2Days.toISOString(),
    };

    const fetchData = async () => {
      const response = await getSensorData(params);
      setData(response?.data);
    };

    fetchData();
  }, [getSensorData, selectedId]);

  if (!data) return <>Loading..</>;

  const prediction_data = data?.predictionRecords ?? [];

  return (
    <DashboardLayout
      firstRow={
        <div>
          <div className="mb-3 w-56"></div>
          <Card title={t("dashboard.hyrefModelPrediction")}>
            <SolarModelWithDustPredictionChart data={prediction_data} />
          </Card>
        </div>
      }
      secondRowLeft={null}
      secondRowRight={null}
      thirdRow={null}
    ></DashboardLayout>
  );
};

export const Route = createFileRoute("/_auth/solarDemoTest")({
  component: Solar,
});
