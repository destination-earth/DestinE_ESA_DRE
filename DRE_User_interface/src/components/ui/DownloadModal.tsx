import React from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./Dialog";
import { Button } from "./Button";
import { cn } from "../../utils/cn";

export interface DownloadOption {
  label: string;
  url: string;
}

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  options: DownloadOption[];
  className?: string;
}

const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  title,
  options,
  className,
}) => {
  const { t } = useTranslation();

  const handleDownload = (url: string) => {
    window.open(url, "_blank");
    // Removed onClose() to keep the modal open after downloading
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-md border-teal-200 border-2", className)}>
        <DialogHeader>
          <DialogTitle className="text-yellow-700">
            {title || t("assessment.results.downloadOptions", "Download Options")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleDownload(option.url)}
              className="h-12 whitespace-nowrap text-teal-600 border-teal-300 hover:bg-teal-50 hover:text-teal-800"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadModal;
