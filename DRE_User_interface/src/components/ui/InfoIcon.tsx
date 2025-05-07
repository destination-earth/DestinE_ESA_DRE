import React from "react";

interface InfoIconProps {
  className?: string;
  size?: number;
}

const InfoIcon: React.FC<InfoIconProps> = ({ className = "", size = 42 }) => {
  return (
    <span className={`inline-block ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path 
          d="M12 7.5V8.5" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
        <path 
          d="M12 11.5V16.5" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
      </svg>
    </span>
  );
};

export default InfoIcon;
