import React from "react";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioButtonGroupProps {
  options: RadioOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  name: string;
  className?: string;
}

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  options,
  selectedValue,
  onChange,
  name,
  className = "",
}) => {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center">
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={() => onChange(option.value)}
            className="h-4 w-4 cursor-pointer border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor={`${name}-${option.value}`}
            className="ml-2 cursor-pointer font-semibold text-sm"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
};

export default RadioButtonGroup;
