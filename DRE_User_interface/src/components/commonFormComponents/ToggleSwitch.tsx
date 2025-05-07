import React from "react";

interface ToggleSwitchProps {
  isChecked: boolean;
  onChange: () => void;
  id: string;
  label: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  isChecked,
  onChange,
  id,
  label,
}) => {
  return (
    <div className="flex items-center">
      <div className="relative mr-3 inline-block h-8 w-16">
        <input
          type="checkbox"
          className="h-0 w-0 opacity-0"
          checked={isChecked}
          onChange={onChange}
          id={id}
        />
        <label
          htmlFor={id}
          className={`absolute bottom-0 left-0 right-0 top-0 cursor-pointer py-4 rounded-full border-4 border-black transition-all duration-300 ${
            isChecked ? "bg-gray-300" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute left-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white border-2 border-black transition-all duration-300 ${
              isChecked ? "" : "translate-x-6 transform"
            }`}
          ></span>
        </label>
      </div>
      <span className="font-semibold">{label}</span>
    </div>
  );
};

export default ToggleSwitch;
