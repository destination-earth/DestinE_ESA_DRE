import React from 'react';

interface OverviewDashboardProps {}

const OverviewDashboard: React.FC<OverviewDashboardProps> = () => {
  const env = import.meta.env;
  const url = env.VITE_BASE_URL;

  return (
<div  style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
  <iframe
    src={`${url}overview.html`}
    style={{ flex: 1, border: "none" }}
    title="Overview"
  />
</div>
  );
};

export default OverviewDashboard;