import React from "react";
import { Outlet } from "@tanstack/react-router";
import Header from "./Header";
import Footer from "./Footer";
// Sidebar imports commented for future reference
// import AppMenu from "../AppMenu";
// import { MenuItem } from "../../models/InitialSettings";

// Sidebar props commented for future reference
// interface MainLayoutProps {
//   menuOpen: boolean;
//   onMenuToggle: () => void;
//   menu: MenuItem[];
// }

interface MainLayoutProps {}

const MainLayout: React.FC<MainLayoutProps> = () => {
  return (
    <div className="flex h-screen flex-col">
      {/* Header - fixed at top */}
      <div className="flex-shrink-0">
        <Header />
      </div>

      {/* Main content area with sidebar - commented out for future reference */}
      {/* <div className="flex flex-1 overflow-hidden pb-16">
        <div className="h-full">
          <AppMenu open={menuOpen} menu={menu} />
        </div>
        <main className="flex-1 overflow-auto p-2">
          <Outlet />
        </main>
      </div> */}

      {/* Current layout without sidebar */}
      <div className="flex-1 overflow-hidden pb-16">
        <main className="h-full overflow-auto p-2">
          <Outlet />
        </main>
      </div>

      {/* Footer is fixed at bottom via its own styling */}
      <Footer />
    </div>
  );
};

export default MainLayout;
