import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { AuthContextType } from "../services/providers/AuthProvider";
import { NotFound } from "../components/views/NotFound";

const Root = () => {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
};

export const Route = createRootRouteWithContext<AuthContextType>()({
  component: Root,
  notFoundComponent: NotFound,
});
