import React, { useRef, useState, useEffect } from "react";
import { Button, CircularProgress, Typography, Alert } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TemplateDownloader from "./TemplateDownloader";
import { TemplateType, EnergyType, getTemplateFileName } from "../../utils/templateUtils";

interface WindTemplateUploadProps {
  onFileUpload: (file: File | null) => void;
  onDownloadTemplate?: () => void; // Made optional since we'll use TemplateDownloader
  shouldReset?: boolean;
  title?: string;
  description?: React.ReactNode;
  uploadPrompt?: string;
  downloadPrompt?: string;
  downloadButtonText?: string;
  onValidate?: () => void; // Function to call for validation
  isValidationLoading?: boolean; // Is validation in progress?
  validationErrorMsg?: string | null; // Message from validation
  isFileValidated?: boolean; // Did validation succeed?
  showValidateButton?: boolean; // New prop to control button visibility
  templateType?: TemplateType; // Type of template to download (train_data or power_curve)
}

const WindTemplateUpload: React.FC<WindTemplateUploadProps> = ({
  onFileUpload,
  onDownloadTemplate,
  onValidate,
  isValidationLoading = false,
  validationErrorMsg = null,
  isFileValidated = false,
  shouldReset = false,
  title = "Template Upload",
  description = "To estimate wind power potential, you can upload wind data using our CSV template. This will allow our system to calculate wind power characteristics based on your measurements. Download the template below, to get started",
  uploadPrompt = "Click or drag file to this area to upload your wind data",
  downloadPrompt = "First time? Download our template:",
  downloadButtonText = "DOWNLOAD TEMPLATE",
  showValidateButton = true, // Default to true
  templateType = TemplateType.TRAIN_DATA, // Default to train_data template
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Reset the component when shouldReset is true
  useEffect(() => {
    if (shouldReset) {
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [shouldReset]);

  const handleUploadClick = () => {
    // Trigger the hidden file input click
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        handleFileSelected(file);
      } else {
        alert("Please upload a CSV file");
      }
    }
  };

  const handleFileSelected = (file: File) => {
    setUploadedFile(file);
    onFileUpload(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileUpload(null);
  };

  return (
    <div className="p-6">
      <h3 className="mb-4 text-lg font-medium">{title}</h3>
      <p className="mb-6 text-gray-600">{description}</p>

      {!uploadedFile ? (
        <div
          className={`mb-8 cursor-pointer rounded-md border-2 border-dashed p-8 text-center transition-colors duration-200 ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:bg-gray-50"
          }`}
          onClick={handleUploadClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mb-4 flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-12 w-12 ${isDragging ? "text-blue-400" : "text-gray-400"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p className="mb-2 text-sm text-gray-500">
            {isDragging ? "Drop file here" : uploadPrompt}
          </p>
          <p className="text-xs text-gray-400">Accepted formats: .csv</p>
        </div>
      ) : (
        <div className="mb-8 rounded-md border-2 border-green-200 bg-green-50 p-8 text-center">
          <div className="mb-4 flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="mb-2 text-sm font-medium text-green-800">
            File uploaded successfully!
          </p>
          <p className="text-sm text-green-700">{uploadedFile.name}</p>
          <button
            onClick={handleRemoveFile}
            className="mt-4 text-xs text-green-600 underline hover:text-green-800"
            disabled={isValidationLoading} // Disable remove button while validating
          >
            Remove file
          </button>

          {/* Conditionally render the validation button and feedback */}
          {showValidateButton && onValidate && (
            <div className="mt-4"> {/* Container for button and feedback */}
              <Button
                variant="contained"
                size="small"
                onClick={onValidate}
                disabled={isValidationLoading || !uploadedFile}
                sx={{ mr: 1 }}
              >
                {isValidationLoading ? "Validating..." : "Validate Template"}
              </Button>
              {isValidationLoading && ( // Show spinner next to button if loading
                <CircularProgress size={24} sx={{ verticalAlign: 'middle' }} />
              )}
              {/* Validation Feedback - styled like solarTemplateUpload */}
              <div className="mt-2">
                {validationErrorMsg && (
                  <Alert severity="error" sx={{ textAlign: 'left' }}>{validationErrorMsg}</Alert>
                )}
                {isFileValidated && !validationErrorMsg && (
                  <Typography color="success.main" variant="body2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                    <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Validated Successfully
                  </Typography>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelected(file);
        }}
      />

      <p className="mb-2 text-sm text-gray-600">{downloadPrompt}</p>
      <div className="flex space-x-4">
        {/* Use the TemplateDownloader component */}
        <TemplateDownloader
          templateType={templateType}
          energyType={EnergyType.WIND}
          buttonText={downloadButtonText}
          fileName={getTemplateFileName(templateType, EnergyType.WIND)}
          className="flex items-center rounded-md border border-green-500 bg-white px-4 py-2 text-sm text-green-500 transition-colors duration-200 hover:bg-green-50"
          // Call the legacy onDownloadTemplate prop if provided (for backward compatibility)
          onClick={onDownloadTemplate}
        />
      </div>
      {/* Conditionally show the note below the buttons if the validation button would be shown */}
      {showValidateButton && (
         <p className="mt-4 text-xs text-gray-500">
           You need to validate your template before proceeding with the
           assessment.
         </p>
      )}
    </div>
  );
};

export default WindTemplateUpload;
