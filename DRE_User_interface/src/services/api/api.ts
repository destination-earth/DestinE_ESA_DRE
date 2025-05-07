import axios from "axios";
import { InitialSettings } from "../../models/InitialSettings";
import { AccessTokenResponse } from "../../models/auth/AccessTokenResponse";
import { RefreshTokenResponse } from "../../models/auth/RefreshTokenResponse";
import { GetSolarDataResponse } from "../../models/GetSolarDataResponse";
import { GetSolarDataResponseDust } from "../../models/GetSolarDataResponseDust";

// This method is to be deprecated!


const env = import.meta.env;

//const MOCK = env.VITE_DEV_MODE;

const client = axios.create({
  baseURL:  env.VITE_BASE_URL,  
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const accessToken = (code: string): Promise<AccessTokenResponse> => {
  const settings = {
    url: "/token/getToken",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: env.VITE_CLIENT_ID,
      client_secret: env.VITE_CLIENT_SECRET,
      redirect_uri: env.CLOACK_REDIRECT_URI,
      code: code,
    }),
  };

  return client(settings);
};

const refreshToken = (token: string): Promise<RefreshTokenResponse> => {
  const settings = {
    url: "/token/refresh",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: new URLSearchParams({
      refreshToken: token,
    }),
  };
  return client(settings);
};

const getInitialSettings = (): Promise<{ data: InitialSettings }> => {
  return client.get("/api/api/settings/initialize");
};

const getSensorData = (params: {
  asset: string;
  startDate: string;
  endDate: string;
}): Promise<{ data: GetSolarDataResponse }> => {
  return client.get("/api/sensorData/solarproduction", {
    params,
  });
};


const getSolarDustData = (params: {
  asset: string;
  startDate: string;
  endDate: string;
}): Promise<{ data: GetSolarDataResponseDust }> => {
  return client.get("/api/sensorData/solarproductiondust", {
    params,
  });
};


const api = {
  refreshToken,
  accessToken,
  getInitialSettings,
  getSensorData,
  getSolarDustData
};

export { client, api };
