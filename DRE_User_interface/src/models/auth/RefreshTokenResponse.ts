export type RefreshTokenResponse = {
  data: {
    access_token: string;
    expires_in: number;
  };
};
