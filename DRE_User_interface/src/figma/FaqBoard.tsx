import React from "react";

interface FaqProps {}

const FaqBoard: React.FC<FaqProps> = () => {
  const env = import.meta.env;
  const url = env.VITE_BASE_URL;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
      <iframe
        src={`${url}faq.html`}
        style={{ flex: 1, border: "none" }}
        title="Faq"
      />
    </div>
  );
};

export default FaqBoard;
