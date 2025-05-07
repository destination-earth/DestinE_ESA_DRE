import React, { useState, useEffect, useRef } from "react";
import { faSun, faWind } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AboutTab from "./AboutTab";
import OneOffTab from "./OneOffTab";
import AnnualTab from "./AnnualTab";

type EnergyType = "solar" | "wind";
type TabType = "about" | "oneoff" | "annual";

// Default energy type to use if none is stored
const DEFAULT_ENERGY_TYPE: EnergyType = "solar";

const ForecastLayout = (): React.ReactNode => {
  const [activeTab, setActiveTab] = useState<TabType>("about");
  const [energyType, setEnergyType] = useState<EnergyType>(DEFAULT_ENERGY_TYPE);
  const [isLoaded, setIsLoaded] = useState(false);
  const initialRenderRef = useRef(true);

  useEffect(() => {
    // This will ensure the energy type is set to solar on first render
    if (initialRenderRef.current) {
      setEnergyType("solar");
      initialRenderRef.current = false;
    }
    setIsLoaded(true);
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleEnergyTypeChange = (type: EnergyType) => {
    setEnergyType(type);
  };

  // Show a loading indicator while the component is initializing
  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with energy type toggle */}
      <div className="mb-4 flex items-center justify-between bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-semibold">Energy Forecast</h1>
        <div className="flex items-center space-x-2">
          <button
            className={`rounded-l-md p-2 ${
              energyType === "solar" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => handleEnergyTypeChange("solar")}
          >
            <FontAwesomeIcon icon={faSun} className="mr-2" />
            Solar
          </button>
          <button
            className={`rounded-r-md p-2 ${
              energyType === "wind" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => handleEnergyTypeChange("wind")}
          >
            <FontAwesomeIcon icon={faWind} className="mr-2" />
            Wind
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="mx-4 mb-6 flex justify-between border-b-2 bg-gray-100 h-16">
        <button
          className={`relative flex-1 px-4 py-2 text-center hover:bg-gray-200 hover:text-gray-900 w-full ${
            activeTab === "about"
              ? "font-semibold text-gray-600"
              : "text-gray-600"
          }`}
          onClick={() => handleTabChange("about")}
        >
          About
          {activeTab === "about" && (
            <div className="absolute bottom-0 left-[37.5%] h-1 w-1/4 bg-gray-600"></div>
          )}
        </button>
        <button
          className={`relative flex-1 px-4 py-2 text-center hover:bg-gray-200 hover:text-gray-900 w-full ${
            activeTab === "oneoff"
              ? "font-medium text-gray-600"
              : "text-gray-600"
          }`}
          onClick={() => handleTabChange("oneoff")}
        >
          One-off
          {activeTab === "oneoff" && (
            <div className="absolute bottom-0 left-[37.5%] h-1 w-1/4 bg-gray-600"></div>
          )}
        </button>
        <button
          className={`relative flex-1 px-4 py-2 text-center hover:bg-gray-200 hover:text-gray-900 w-full ${
            activeTab === "annual"
              ? "font-medium text-gray-600"
              : "text-gray-600"
          }`}
          onClick={() => handleTabChange("annual")}
        >
          Annual Forecasting Service
          {activeTab === "annual" && (
            <div className="absolute bottom-0 left-[37.5%] h-1 w-1/4 bg-gray-600"></div>
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === "about" && (
          <AboutTab energyType={energyType || "solar"} />
        )}
        {activeTab === "oneoff" && (
          <OneOffTab energyType={energyType || "solar"} />
        )}
        {activeTab === "annual" && (
          <AnnualTab energyType={energyType || "solar"} />
        )}
      </div>
    </div>
  );
};

export default ForecastLayout;
