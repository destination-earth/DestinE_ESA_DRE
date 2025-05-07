import React from "react";

interface AssessmentProps {}

const AssessmentDashboard: React.FC<AssessmentProps> = () => {
  const env = import.meta.env;
  const url = env.VITE_BASE_URL;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
      <iframe
        src={`${url}assessment.html`}
        style={{ flex: 1, border: "none" }}
        title="Assessment"
      />
    </div>
  );
};

export default AssessmentDashboard;
