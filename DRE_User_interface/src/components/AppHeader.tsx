import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faWind, faSun } from "@fortawesome/free-solid-svg-icons";
import Avatar from "./ui/Avatar";
import Menu from "./ui/Menu";
import { useAuth } from "../hooks/useAuth";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useRouter } from "@tanstack/react-router";

interface Props {
  onMenuToggle: () => void;
  onEnergySelect: (type: "solar" | "wind" | null) => void; // Callback function
}

const AppHeader = ({ onMenuToggle, onEnergySelect }: Props) => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogoutClick = () => logout();
  const [activeEnergy, setActiveEnergy] = useState<"solar" | "wind" | null>(null);

  const handleEnergySelect = (type: "solar" | "wind") => {
    setActiveEnergy(type);
    onEnergySelect(type); // Notify parent (_auth.tsx)
  };

  return (
    <header className="flex h-14 items-center shadow-md">
      <button className="flex aspect-square w-14 items-center justify-center border-r" onClick={onMenuToggle}>
        <FontAwesomeIcon icon={faBars} />
      </button>
      <div className="flex-1 px-4">
        <Link to={"/"}>Hybrid Renewable Energy Forecasting System (HYREF)</Link>
      </div>
      
  
      <div className="w-12 hidden"  >
        <button className="flex aspect-square" onClick={() => handleEnergySelect("solar")}>
          <FontAwesomeIcon icon={faSun} className={activeEnergy === "solar" ? "text-orange-500" : "text-gray-500"} />
        </button>
      </div>

 
      <div className="w-12 hidden">
        <button className="flex aspect-square" onClick={() => handleEnergySelect("wind")}>
          <FontAwesomeIcon icon={faWind} className={activeEnergy === "wind" ? "text-blue-500" : "text-gray-500"} />
        </button>
      </div>

      <div className="w-14">
        <Menu
          trigger={<Avatar />}
          options={[
            { name: "My Profile", handler: () => router.navigate({ to: "/profile" }) },
            { name: "Logout", handler: handleLogoutClick },
          ]}
        />
      </div>
    </header>
  );
};

export default AppHeader;
