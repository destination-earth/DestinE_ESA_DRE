import React from 'react';

interface ProfileBoardProps {}

const ProfileBoard: React.FC<ProfileBoardProps> = () => {
  const env = import.meta.env;
  const url = env.VITE_BASE_URL;

  return (
<div  style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
  <iframe
    src={`${url}profile.html`}
    style={{ flex: 1, border: "none" }}
    title="Profile"
  />
</div>
  );
};

export default ProfileBoard;