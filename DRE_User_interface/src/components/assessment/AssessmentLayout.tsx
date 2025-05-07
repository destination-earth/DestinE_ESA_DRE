import React, { useState, useEffect, useRef } from "react";
import { faSun, faWind } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AboutTab from "./AboutTab";
import BasicTab from "./BasicTab";
import PremiumTab from "./PremiumTab";
import { useTranslation } from "react-i18next";

type EnergyType = "solar" | "wind";
type TabType = "about" | "basic" | "premium";

// Default energy type to use if none is stored
const DEFAULT_ENERGY_TYPE: EnergyType = "solar";

const AssessmentLayout = (): React.ReactNode => {
  const { t } = useTranslation();
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
        <h1 className="text-2xl font-semibold">Energy Assessment</h1>
        <div className="flex items-center space-x-2">
          <button
            className={`rounded-l-md p-2 ${
              energyType === "solar" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => handleEnergyTypeChange("solar")}
          >
            <FontAwesomeIcon icon={faSun} className="mr-2" />
            {t("assessment.layout.energyType.solar", "Solar")}
          </button>
          <button
            className={`rounded-r-md p-2 ${
              energyType === "wind" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => handleEnergyTypeChange("wind")}
          >
            <FontAwesomeIcon icon={faWind} className="mr-2" />
            {t("assessment.layout.energyType.wind", "Wind")}
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="mx-4 mb-6 flex justify-between border-b-2 bg-gray-100 h-16">
        <button
          className={`relative w-full flex-1 px-4 py-2 text-center hover:bg-gray-200 hover:text-gray-900 ${
            activeTab === "about"
              ? "font-semibold text-gray-600"
              : "text-gray-600"
          }`}
          onClick={() => handleTabChange("about")}
        >
          {t("assessment.layout.tabTitle.about", "About")}
          {activeTab === "about" && (
            <div className="absolute bottom-0 left-[37.5%] h-1 w-1/4 bg-gray-600"></div>
          )}
        </button>
        <button
          className={`relative w-full flex-1 px-4 py-2 text-center hover:bg-gray-200 hover:text-gray-900 ${
            activeTab === "basic"
              ? "font-medium text-gray-600"
              : "text-gray-600"
          }`}
          onClick={() => handleTabChange("basic")}
        >
          {t("assessment.layout.tabTitle.basic", "Basic")}
          {activeTab === "basic" && (
            <div className="absolute bottom-0 left-[37.5%] h-1 w-1/4 bg-gray-600"></div>
          )}
        </button>
        <button
          className={`relative w-full flex-1 px-4 py-2 text-center hover:bg-gray-200 hover:text-gray-900 ${
            activeTab === "premium"
              ? "font-medium text-gray-600"
              : "text-gray-600"
          }`}
          onClick={() => handleTabChange("premium")}
        >
          {t("assessment.layout.tabTitle.premium", "Premium")}
          {activeTab === "premium" && (
            <div className="absolute bottom-0 left-[37.5%] h-1 w-1/4 bg-gray-600"></div>
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === "about" && (
          <AboutTab energyType={energyType || "solar"} />
        )}
        {activeTab === "basic" && (
          <BasicTab energyType={energyType || "solar"} />
        )}
        {activeTab === "premium" && (
          <PremiumTab energyType={energyType || "solar"} />
        )}
      </div>
    </div>
  );
};

export default AssessmentLayout;
