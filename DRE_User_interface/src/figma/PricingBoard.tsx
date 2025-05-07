import React from 'react';

interface PricingProps {}

const PricingBoard: React.FC<PricingProps> = () => {
  const env = import.meta.env;
  const url = env.VITE_BASE_URL;

  return (
<div  style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
  <iframe
    src={`${url}pricing.html`}
    style={{ flex: 1, border: "none" }}
    title="Forecast"
  />
</div>
  );
};

export default PricingBoard;