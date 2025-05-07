import { createFileRoute } from "@tanstack/react-router";
import DocumentationBoard from "../figma/DocumentationBoard";

const Documentation = () => {
  return (
    <div  style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
        <DocumentationBoard/>
      </div>
 
  );
};

export const Route = createFileRoute("/_auth/documentation")({
  component: Documentation,
});