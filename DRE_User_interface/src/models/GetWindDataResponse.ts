import { KPI} from "../models/GetSolarDataResponse";

export type BaseRecord = {
  datetime: string; 
};

export type windDataTable = BaseRecord & {
  direction: number;
  powerKw: number;
  airSpeed: number;
};


export type comparison =   BaseRecord & {
  outputpower: number;
  forecastpower: number;
};
 
export type GetWindDemoDataResponse = {
  kpis: KPI[];
  outputData: windDataTable[]
  forecastData: windDataTable[];
  windComparison: comparison[];
};

 

