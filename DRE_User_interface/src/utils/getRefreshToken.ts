export const getRefreshToken = () => {
  try {
    const refresh_token = sessionStorage.getItem("refresh_token");
    return refresh_token;
  } catch (error) {
    return null;
  }
};
