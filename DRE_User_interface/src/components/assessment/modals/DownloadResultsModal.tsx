import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../ui/Button";
import DownloadModal from "../../ui/DownloadModal";

export interface DownloadOption {
  label: string;
  url: string;
}

interface DownloadResultsModalProps {
  csvLinks: string[];
  buttonLabel?: string;
  formatDownloadOptions?: (csvLinks: string[]) => DownloadOption[];
  onDownload?: () => void;
  className?: string;
}

/**
 * A reusable component for handling assessment results downloads
 * Can be used by both SolarAssessmentResults and WindAssessmentResults
 */
const DownloadResultsModal: React.FC<DownloadResultsModalProps> = ({
  csvLinks,
  buttonLabel,
  formatDownloadOptions,
  onDownload,
  className,
}) => {
  const { t } = useTranslation();
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // Default function to format download options if none provided
  const defaultFormatOptions = (links: string[]): DownloadOption[] => {
    // If there's only one link, return it with a generic label
    if (links.length === 1) {
      return [{ label: t("assessment.results.downloadCSV", "DOWNLOAD CSV"), url: links[0] }];
    }
    
    // For multiple links, create descriptive labels based on the URL
    return links.map(url => {
      let label = t("assessment.results.downloadCSV", "DOWNLOAD CSV");
      
      if (url.includes("power_output")) {
        label = t("assessment.results.downloadPowerOutput", "Power Output Data");
      } else if (url.includes("wind_speed")) {
        label = t("assessment.results.downloadWindSpeed", "Wind Speed Data");
      } else if (url.includes("15minute")) {
        label = t("assessment.results.download15Min", "15-Minute Resolution");
      } else if (url.includes("1minute")) {
        label = t("assessment.results.download1Min", "1-Minute Resolution");
      } else if (url.includes("1hour")) {
        label = t("assessment.results.downloadHourly", "Hourly Resolution");
      } else if (url.includes("1day")) {
        label = t("assessment.results.downloadDaily", "Daily Resolution");
      } else if (url.includes("1month")) {
        label = t("assessment.results.downloadMonthly", "Monthly Resolution");
      }
      
      return { label, url };
    });
  };

  // Use provided format function or default
  const getDownloadOptions = (): DownloadOption[] => {
    if (!csvLinks || csvLinks.length === 0) return [];
    
    return formatDownloadOptions 
      ? formatDownloadOptions(csvLinks) 
      : defaultFormatOptions(csvLinks);
  };

  // Handle download action
  const handleDownload = () => {
    // If custom download handler is provided, use it
    if (onDownload) {
      onDownload();
      return;
    }
    
    if (!csvLinks || csvLinks.length === 0) return;

    // If only one link, open it directly
    if (csvLinks.length === 1) {
      window.open(csvLinks[0], "_blank");
      return;
    }

    // If multiple links, open the modal
    setIsDownloadModalOpen(true);
  };

  // If no links, don't render anything
  if (!csvLinks || csvLinks.length === 0) return null;

  return (
    <>
      <div className={`mb-8 flex justify-end ${className}`}>
        <Button
          variant="outline"
          onClick={handleDownload}
          className="h-12 whitespace-nowrap"
        >
          {buttonLabel || t("assessment.results.downloadCSV", "DOWNLOAD CSV")}
        </Button>
      </div>

      {/* Download Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        options={getDownloadOptions()}
        className="bg-gray-300"
      />
    </>
  );
};

export default DownloadResultsModal;