export type KPI = {
  details?: string;
  label: string;
  value: string;
  id:number
};

export type BaseRecord = {
  ambientTemperature: number;
  datetime: string;
  solarIrradiationDust: number;
};

export type MeteroLogicalRecord = BaseRecord;

export type PredictionRecord = BaseRecord & {
  powerKw: number;
  powerKwDust: number;
  solarIrradiation: number;
};

export type OldSolarItem = PredictionRecord & {
  ghiwhm2: number;
};

export type ProductionRecord = PredictionRecord;

export type GetSolarDataResponse = {
  kpis: KPI[];
  meterologicalData: MeteroLogicalRecord[];
  predictionRecords: PredictionRecord[];
  productionRecords: ProductionRecord[];
};
