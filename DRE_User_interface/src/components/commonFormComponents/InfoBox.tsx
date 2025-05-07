import React, { ReactNode } from "react";
import { Button } from "../ui/Button";
import InfoIcon from "../ui/InfoIcon";

interface InfoBoxProps {
  text?: ReactNode;
  description?: ReactNode;
  title?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
}

const InfoBox = ({
  text,
  description,
  title,
  buttonText,
  onButtonClick,
  className = "",
}: InfoBoxProps): React.ReactNode => {
  // Use description if provided, otherwise use text
  const displayText = description || text || "";

  return (
    <div className={`mb-6 rounded-lg border border-blue-100 p-4 ${className}`}>
      <div className="flex items-start">
        <InfoIcon className="mr-2 mt-1 text-black" />
        <div>
          {title && <h3 className="mb-2 font-medium text-gray-900">{title}</h3>}
          <div className="text-sm text-gray-700">{displayText}</div>
        </div>
      </div>
      {buttonText && onButtonClick && (
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onButtonClick}
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
          >
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default InfoBox;
