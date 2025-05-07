import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

function LoginComponent() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/" });
      return;
    }
  }, [isAuthenticated, navigate]);

  return <div className="">loggin redirect..</div>;
}

export const Route = createFileRoute("/_public/login")({
  component: LoginComponent,
});
