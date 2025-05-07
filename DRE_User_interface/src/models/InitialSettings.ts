import { MenuIconMap } from "./maps/MenuIconMap";

export type MenuItem = {
  id: number;
  name: string;
  type: string;
  icon: keyof typeof MenuIconMap;
  children: MenuItem[];
};

export type MainSite = {
  value: string;
  key: string;
  type: string;
};

export type InitialSettings = {
  lastLogin: string;
  mainSites: MainSite[];
  menu: MenuItem[];
  userName: string;
  userType: string;
};
