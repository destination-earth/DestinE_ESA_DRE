import { createFileRoute } from "@tanstack/react-router";
import ProfileBoard from "../figma/ProfileBoard";

const Profile = () => {
  return (
    <div  style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
        <ProfileBoard/>
      </div>
 
  );
};

export const Route = createFileRoute("/_auth/profile")({
  component: Profile,
});