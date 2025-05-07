import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

function LogoutComponent() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/" });
      console.log("I would redirect to home");
      return;
    } else {
      // window.location.replace("http://localhost:1000/");
      console.log("LOGIN!!");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex h-[90vh] items-center justify-center text-center">
      {/* <div className="m-auto flex w-2/3 flex-col justify-center gap-3">
        <a
          className="rounded bg-blue-500 p-2 text-white"
          href={"http://localhost:1000/"}
        >
          Login
        </a>
      </div> */}
    </div>
  );
}

export const Route = createFileRoute("/_public/logout")({
  component: LogoutComponent,
});
