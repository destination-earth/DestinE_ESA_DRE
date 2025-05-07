import React from "react";

interface Option {
  value: string;
  label: string;
}

interface FloatingLabelSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

const FloatingLabelSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Value",
  className = "",
}: FloatingLabelSelectProps): React.ReactNode => {
  return (
    <div className={`relative ${className}`}>
      <div className="h-16">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-16 w-full appearance-none p-2 bg-white text-gray-500 focus:outline-none focus:ring-0 border-2 border-gray-300 border-b-2 border-b-gray-300"
          style={{ height: "64px" }} // Match the height of ValidatedInput
        >
          <option value="" className="text-gray-500">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      <label
        className="absolute -top-2.5 left-2 bg-white px-1 text-xs font-medium text-gray-400"
        htmlFor={id}
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingLabelSelect;
