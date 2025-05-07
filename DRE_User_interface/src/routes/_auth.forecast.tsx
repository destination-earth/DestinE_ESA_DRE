import { createFileRoute } from "@tanstack/react-router";
import ForecastPage from   "../components/pages/ForecastPage";

const Forecast = () => {
  return (
    <div  style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
      <ForecastPage/>
      </div>
 
  );
};
 

export const Route = createFileRoute("/_auth/forecast")({
  component: Forecast,
});
