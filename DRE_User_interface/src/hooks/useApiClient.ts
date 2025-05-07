import { useContext } from "react";
import { ApiContext } from "../services/providers/ApiProvider";

export const useApiClient = () => {
  const apiContext = useContext(ApiContext);
  if (!apiContext)
    throw new Error("useApiClient must be used within an ApiProvider");
  return apiContext;
};
