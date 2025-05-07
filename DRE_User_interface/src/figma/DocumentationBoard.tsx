import React from "react";

interface DocumentationProps {}

const DocumentationBoard: React.FC<DocumentationProps> = () => {
  const env = import.meta.env;
  const url = env.VITE_BASE_URL;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
      <iframe
        src={`${url}documentation.html`}
        style={{ flex: 1, border: "none" }}
        title="Assessment"
      />
    </div>
  );
};

export default DocumentationBoard;
