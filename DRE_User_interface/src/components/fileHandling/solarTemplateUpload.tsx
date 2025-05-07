import React, { useRef, useState, useEffect } from "react";
import InfoBox from "../commonFormComponents/InfoBox";
import { AnnualForecastInfoBox } from "../forecast/text/ForecastAnnualText";
import { Button, CircularProgress, Typography, Alert } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TemplateDownloader from "./TemplateDownloader";
import { TemplateType, EnergyType, getTemplateFileName } from "../../utils/templateUtils";

interface SolarTemplateUploadProps {
  onFileUpload: (file: File | null) => void;
  onDownloadTemplate?: () => void; // Made optional since we'll use TemplateDownloader
  shouldReset?: boolean;
  formType?: "oneoff" | "annual";
  onValidate: () => void;
  isValidationLoading: boolean;
  validationErrorMsg: string | null;
  isFileValidated: boolean;
  templateType?: TemplateType; // Type of template to download
}

const SolarTemplateUpload: React.FC<SolarTemplateUploadProps> = ({
  onFileUpload,
  onDownloadTemplate,
  shouldReset = false,
  formType = "oneoff",
  onValidate,
  isValidationLoading,
  validationErrorMsg,
  isFileValidated,
  templateType = TemplateType.TRAIN_DATA, // Default to train_data template
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    if (shouldReset) {
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [shouldReset]);

  const handleUploadClick = () => {
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
      <h3 className="mb-4 text-lg font-medium">Template Upload</h3>
      <p className="mb-6 text-gray-600">
        To generate accurate 2-day solar energy production forecasts, we invite
        you to upload your solar park data using our CSV template. This data
        allows our system to train a tailored prediction model based on your
        specific site conditions. Download the template below to get started!{" "}
        <br />
        Before uploading your file, please ensure it meets all validation
        requirements. The file must be in CSV format and contain exactly two
        columns with the following case-sensitive names: time_utc and
        total_production_active_power_kW. The time_utc column must follow the
        ISO 8601 format (e.g., 2023-06-01T08:00:00Z or 2023-06-01 08:00:00),
        with time intervals exactly every 15 minutes, no duplicate timestamps,
        and no future timestamps beyond three days ago. The
        total_production_active_power_kW column must contain only numerical
        values (floats) between 0 and 100,000. The file must not include any
        empty cells or text values in numeric fields. If any of these rules are
        violated, the entire file will be rejected. You will receive an error
        report indicating the row number and the type of issue, so you can
        correct the file and re-upload it.
      </p>

      {formType === "annual" && (
        <InfoBox
          title={"Please Note"}
          text={<AnnualForecastInfoBox />}
        />
      )}

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
            {isDragging
              ? "Drop file here"
              : "Click or drag file to this area to upload your Solar data"}
          </p>
          <p className="text-xs text-gray-400">Accepted formats: .csv</p>
        </div>
      ) : (
        <div className="mb-4 rounded-md border-2 border-green-200 bg-green-50 p-6 text-center">
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
            File selected:
          </p>
          <p className="text-sm text-green-700">{uploadedFile.name}</p>
          <button
            onClick={handleRemoveFile}
            className="mt-1 text-xs text-green-600 underline hover:text-green-800"
            disabled={isValidationLoading}
          >
            Remove file
          </button>

          <div className="mt-4">
            <Button
              variant="contained"
              size="small"
              onClick={onValidate}
              disabled={isValidationLoading || !uploadedFile}
              sx={{ mr: 1 }}
            >
              Validate File
            </Button>
            {isValidationLoading && (
              <CircularProgress size={24} sx={{ verticalAlign: 'middle' }} />
            )}
          </div>

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

      <p className="mb-2 text-sm text-gray-600">
        First time? Download our template:
      </p>
      <div className="flex space-x-4">
        {/* Use the TemplateDownloader component */}
        <TemplateDownloader
          templateType={templateType}
          energyType={EnergyType.SOLAR}
          buttonText="DOWNLOAD TEMPLATE"
          fileName={getTemplateFileName(templateType, EnergyType.SOLAR)}
          className="flex items-center rounded-md border border-green-500 bg-white px-4 py-2 text-sm text-green-500 transition-colors duration-200 hover:bg-green-50"
          // Call the legacy onDownloadTemplate prop if provided (for backward compatibility)
          onClick={onDownloadTemplate}
        />
      </div>
      <p className="mt-4 text-xs text-gray-500">
        You have to validate the document before being able to order your
        forecast.
      </p>
    </div>
  );
};

export default SolarTemplateUpload;
