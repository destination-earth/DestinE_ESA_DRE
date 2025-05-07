import React from "react";

interface Props {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: { id: string; label: string }[]; // Labels are passed as props
}

const NavigationTabs: React.FC<Props> = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="bg-purple-100 flex justify-around items-center p-3 relative">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`text-gray-700 px-4 py-2 relative ${
            activeTab === tab.id ? "text-purple-700 font-semibold" : ""
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 w-full h-[3px] bg-purple-700"></span>
          )}
        </button>
      ))}
    </div>
  );
};

export default NavigationTabs;
