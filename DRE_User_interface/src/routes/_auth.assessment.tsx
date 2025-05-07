import { createFileRoute } from "@tanstack/react-router";
import AssessmentPage from '../components/pages/AssessmentPage';

const Assessment = () => {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
      <AssessmentPage />
    </div>
  );
};

export const Route = createFileRoute("/_auth/assessment")({
  component: Assessment,
});
