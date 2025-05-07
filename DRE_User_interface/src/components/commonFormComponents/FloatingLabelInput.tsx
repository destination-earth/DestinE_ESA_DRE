import React, { ReactNode } from "react";

interface FloatingLabelInputProps {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}

const FloatingLabelInput = ({
  id,
  label,
  children,
  className = "",
}: FloatingLabelInputProps): React.ReactNode => {
  return (
    <div className="relative">
      <div
        className={`h-12 ${className}`}
      >
        {children}
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

export default FloatingLabelInput;
