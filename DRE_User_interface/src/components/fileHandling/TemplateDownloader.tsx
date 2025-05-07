import React from "react";
import { TemplateType, EnergyType, getTemplateUrl } from "../../utils/templateUtils";

interface TemplateDownloaderProps {
  templateType: TemplateType;
  energyType: EnergyType;
  buttonText: string;
  className?: string;
  fileName?: string;
  onClick?: () => void; // Optional callback for backward compatibility
}

/**
 * A component for downloading template files
 */
const TemplateDownloader: React.FC<TemplateDownloaderProps> = ({
  templateType,
  energyType,
  buttonText,
  className = "",
  fileName = "template.csv",
  onClick,
}) => {
  const handleDownload = () => {
    // Get the template URL based on the template type and energy type
    const templateUrl = getTemplateUrl(templateType, energyType);
    console.log('Downloading template:', templateType, 'for', energyType);
    console.log('Template URL:', templateUrl);
    console.log('Filename:', fileName);
    
    try {
      // Add a timestamp to the URL to prevent caching issues
      const timestampedUrl = `${templateUrl}?t=${new Date().getTime()}`;
      
      // Open the URL in a new window/tab
      // This forces the browser to treat each download as unique
      window.open(timestampedUrl, '_blank');
      
      console.log('Download initiated successfully');
      
      // Call the onClick callback if provided (for backward compatibility)
      if (onClick) {
        onClick();
      }
    } catch (error) {
      console.error('Error during template download:', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className={className || "flex items-center rounded-md border border-green-500 bg-white px-4 py-2 text-sm text-green-500 transition-colors duration-200 hover:bg-green-50"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2 h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      {buttonText}
    </button>
  );
};

export default TemplateDownloader;
