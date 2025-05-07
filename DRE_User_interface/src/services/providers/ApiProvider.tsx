import axios from "axios";
import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import { GetSolarDataResponse } from "../../models/GetSolarDataResponse";
import { GetSolarDataResponseDust } from "../../models/GetSolarDataResponseDust";
import { GetWindDemoDataResponse } from "../../models/GetWindDataResponse";
import { GetHybridDemoDataResponse } from "../../models/GetHybridDataResponse";
import { InitialSettings } from "../../models/InitialSettings";
import { GetDataParams, SingleFilter } from "../../models/GetDataParams";
import { JobDataResponse } from "../../models/JobsResponses";



const env = import.meta.env;

export type ApiContextType = {
  initialSettings: InitialSettings | null | undefined;
  
  getInitialSettings: () => Promise<{ data: InitialSettings }>;
  
  getSensorData: (
    params: GetDataParams,
  ) => Promise<{ data: GetSolarDataResponse }>;
  
  getSolarDustData: (
    params: GetDataParams,
  ) => Promise<{ data: GetSolarDataResponseDust }>;

  getWindDemoData: (
    params: GetDataParams,
  ) => Promise<{ data: GetWindDemoDataResponse }>;

  getHybridDemoData: (
    params: GetDataParams,
  ) => Promise<{ data: GetHybridDemoDataResponse }>;

  getJobsData: (
    params:SingleFilter,
  ) => Promise<{ data: JobDataResponse }>;
};

export const ApiContext = createContext<ApiContextType>({
  initialSettings: undefined,
  getInitialSettings: (): Promise<{ data: InitialSettings }> => {
    throw new Error("Function not implemented.");
  },
  getSensorData: (
    params: GetDataParams,
  ): Promise<{ data: GetSolarDataResponse }> => {
    console.log(params);
    throw new Error("Function not implemented.");
  },
  getSolarDustData: (
    params: GetDataParams,
  ): Promise<{ data: GetSolarDataResponseDust }> => {
    console.log(params);
    throw new Error("Function not implemented.");
  },

  getWindDemoData: (
    params: GetDataParams,
  ): Promise<{ data: GetWindDemoDataResponse }> => {
    console.log(params);
    throw new Error("Function not implemented.");
  },

  getHybridDemoData: (
    params: GetDataParams,
  ): Promise<{ data: GetHybridDemoDataResponse }> => {
    console.log(params);
    throw new Error("Function not implemented.");
  },


  getJobsData: (  
    params:SingleFilter,  
  ): Promise<{ data: JobDataResponse }> => {
    console.log(params);
    throw new Error("Function not implemented.");
  },


});

interface Props {
  accessToken: string | null | undefined;
  children: ReactNode;
  onUnauthorisedError: () => void;
}

const ApiProvider = ({ accessToken, children, onUnauthorisedError }: Props) => {
  const [initialSettings, setInitialSettings] = useState<
    InitialSettings | null | undefined
  >();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const axiosClient = useMemo(() => {
    const client = axios.create({
      baseURL: env.VITE_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    client.interceptors.response.use(
      (response) => {
        // If the response is successful, return it as-is
        return response;
      },
      async (error) => {
        // Check if the error response status is 401
        if (error.response && error.response.status === 401) {
          console.log("Unauthorized! Handling 401...");
          onUnauthorisedError();
        }
        // Reject the error so it propagates to the caller
        return Promise.reject(error);
      },
    );

    return client;
  }, [accessToken, onUnauthorisedError]);

  const getInitialSettings = (): Promise<{ data: InitialSettings }> => {
    return  axiosClient.get("/api/settings/initialize");
  };


  const getSensorData = (
    params: GetDataParams,
  ): Promise<{ data: GetSolarDataResponse }> => {
    return axiosClient.get("/api/sensorData/solarproductiondemo", {
      params,
    });
  };


  const getSolarDustData = (
    params: GetDataParams,
  ): Promise<{ data: GetSolarDataResponseDust }> => {
    return axiosClient.get("/api/sensorData/solarproductiondustdemo", {
      params,
    });
  };


  const getWindDemoData = (
    params: GetDataParams,
  ): Promise<{ data: GetWindDemoDataResponse }> => {
    return axiosClient.get("/api/sensorData/winddemo", {
      params,
    });
  };


  const getHybridDemoData = (
    params: GetDataParams,
  ): Promise<{ data: GetHybridDemoDataResponse }> => {
    return axiosClient.get("/api/sensorData/hybriddemo", {
      params,
    });
  };


  const getJobsData = (
    params: SingleFilter,
  ): Promise<{ data: JobDataResponse }> => {
    return axiosClient.get("/api/Jobs/userJobs", {params,});
  };
 

  useEffect(() => {
    const fetchInitialSettings = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClient.get("/api/settings/initialize");
        setInitialSettings(response?.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialSettings();
  }, [axiosClient]);

  return (
    <ApiContext.Provider
      value={{
        getInitialSettings,
        getSensorData,
        getSolarDustData,
        getWindDemoData,
        getHybridDemoData,
        getJobsData,
        initialSettings,
       
        
      }}
    >
      {isLoading ? <span>Loading...</span> : children}
    </ApiContext.Provider>
  );
};

export default ApiProvider;
