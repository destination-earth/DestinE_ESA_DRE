import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
  context: {
    isAuthenticated: false,
    accessToken: "",
    handleUnAuthorizedError: async () => undefined,
    logout: () => {},
    apiInitialized: false,
    redirectToLogin: () => {},
    waitForAuth: async () => true,
    addTokenChangeListener: () => () => {},
  },
});
