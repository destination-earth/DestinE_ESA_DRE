import { InternalAxiosRequestConfig } from "axios";

export type CustomInternalAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};
