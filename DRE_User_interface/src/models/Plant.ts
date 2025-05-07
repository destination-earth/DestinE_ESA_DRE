import { PlantTypeEnum } from "./enum/PlantType.enum";

export type Plant = {
  id: string;
  name: string;
  customerId: string;
  location: {
    srid: number;
    latitude: number;
    longitude: number;
    altitude: number;
  };
  plantType: {
    value: PlantTypeEnum;
    name: string;
  };
};
