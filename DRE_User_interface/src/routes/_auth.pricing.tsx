import { createFileRoute } from "@tanstack/react-router";
import PricingPage from "../components/pages/PricingPage"; // Import the new page component

// Define the component for this route
const PricingRouteComponent = () => {
  return (
    <PricingPage /> // Render the PricingPage component
  );
};

// Define the file route
export const Route = createFileRoute("/_auth/pricing")({
  component: PricingRouteComponent,
});