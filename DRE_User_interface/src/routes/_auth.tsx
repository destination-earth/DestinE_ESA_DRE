/*
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import AppHeader from "../components/AppHeader";
import AppMenu from "../components/AppMenu";
import { useState } from "react";
import { useApiClient } from "../hooks/useApiClient";


function LayoutComponent() {
  const [menuOpen, setMenuOpen] = useState<boolean>(true);
  const { initialSettings } = useApiClient();

  const handleEnergySelect = (energyType: "solar" | "wind" | null) => {
    console.log("Energy selected:", energyType);
    // Add any additional logic needed when the energy type is selected
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-0">
        <AppHeader
          onMenuToggle={() => setMenuOpen((prev) => !prev)}
          onEnergySelect={handleEnergySelect}
        />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div>
          <AppMenu open={menuOpen} menu={initialSettings?.menu ?? []} />
        </div>
        <main className="flex-1 overflow-auto p-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_auth")({
  component: LayoutComponent,
  beforeLoad: ({ context }) => {
    const { isAuthenticated } = context;
    if (!isAuthenticated) {
      throw redirect({
        to: "/logout",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});

*/

import { createFileRoute, redirect } from "@tanstack/react-router";
// Sidebar imports commented for future reference
// import { useState } from "react";
// import { useApiClient } from "../hooks/useApiClient";
import MainLayout from "../components/headerFooter/MainLayout";

function LayoutComponent() {
  // Menu state commented for future reference
  // const [menuOpen, setMenuOpen] = useState<boolean>(true);
  // const { initialSettings } = useApiClient();

  return <MainLayout />
  // Previous version with menu:
  // return (
  //   <MainLayout
  //     menuOpen={menuOpen}
  //     onMenuToggle={() => setMenuOpen((prev) => !prev)}
  //     menu={initialSettings?.menu ?? []}
  //   />
  // );
}

export const Route = createFileRoute("/_auth")({
  component: LayoutComponent,
  beforeLoad: ({ context }) => {
    const { isAuthenticated } = context;
    if (!isAuthenticated) {
      throw redirect({
        to: "/logout",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});
