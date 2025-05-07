import { comparison, BaseRecord} from "../models/GetWindDataResponse";

 

export type hybridDataTable = BaseRecord & {
  directionWind: number;
  powerkWWind: number;
  airSpeedWind: number;
  ambientTemperature: number,
  solarIrradiance: number,
  powerkWSolar:number,
  powerkWTotal:number
};


export type GetHybridDemoDataResponse = {
  outputData: hybridDataTable[]
  forecastData: hybridDataTable[];
  hybridComparison: comparison[];
};

 

