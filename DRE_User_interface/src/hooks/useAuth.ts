import { useContext } from "react";
import { AuthContext } from "../services/providers/AuthProvider";

export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext)
    throw new Error("useAuth must be used within an AuthProvider");
  return authContext;
};
