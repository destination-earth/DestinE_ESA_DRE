import React, { useState, useRef } from "react";
import FloatingLabelSelect from "../../commonFormComponents/FloatingLabelSelect";
import HubHeightInput from "../../commonFormComponents/HubHeightInput";
import { ValidatedInputRef } from "../../../services/validation/formValidation/ValidatedInput";
import { Button } from "../../ui/Button";

interface PremiumWindInputsProps {
  hubHeight: string;
  powerCurveModel: string;
  onHubHeightChange: (value: string) => void;
  onPowerCurveModelChange: (value: string) => void;
  numberValidation: (value: string) => boolean;
  hubHeightValidation?: (value: string) => boolean;
  hubHeightRef?: React.RefObject<ValidatedInputRef>;
  onFileUploadSuccess?: (file: File) => void; // Callback when file upload is successful
}

const PremiumWindInputs = ({
  hubHeight,
  powerCurveModel,
  onHubHeightChange,
  onPowerCurveModelChange,
  numberValidation,
  hubHeightValidation,
  hubHeightRef,
  onFileUploadSuccess,
}: PremiumWindInputsProps): React.ReactNode => {
  // Define a constant for the custom upload option
  const UPLOAD_CUSTOM_OPTION = "upload_custom";
  
  // State for file handling
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Explicitly check if the power curve model is set to the custom upload option
  const isCustomUploadSelected = powerCurveModel === UPLOAD_CUSTOM_OPTION;

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setFileName(file?.name || "");
    
    // Debug log
    console.log("File selected:", {
      file: file ? file.name : null,
      size: file ? file.size : null,
      type: file ? file.type : null,
    });
    
    // Call the success callback to update the fileUploaded flag in the parent component
    if (file && onFileUploadSuccess) {
      onFileUploadSuccess(file);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="col-span-4 grid grid-cols-1 gap-6 md:grid-cols-4">
      <HubHeightInput
        value={hubHeight}
        onChange={onHubHeightChange}
        validate={hubHeightValidation || numberValidation}
        placeholder="Enter hub height (m)"
        inputRef={hubHeightRef}
        errorMessage="Hub height must be between 40 and 300 meters"
      />

      <FloatingLabelSelect
        id="powerCurveModel"
        label="Power Curve Models"
        value={powerCurveModel}
        onChange={onPowerCurveModelChange}
        options={[
          {
            value: UPLOAD_CUSTOM_OPTION,
            label: "Upload Your Power Curve",
          },
          {
            value: "V112_3MW_offshore",
            label: "V112_3MW_offshore",
          },
          {
            value: "Vestas_V112_3MW",
            label: "Vestas_V112_3MW",
          },
        ]}
        placeholder="Select model"
      />

      {isCustomUploadSelected && (
        <div className="col-span-2">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".csv"
          />
          
          {/* File selection button */}
          <Button
            type="button"
            variant="outline"
            className="h-16 w-full rounded border border-blue-600 px-4 py-4 text-blue-600 hover:bg-blue-50"
            onClick={() => fileInputRef.current?.click()}
          >
            SELECT POWER CURVE FILE
          </Button>
          
          {/* Display selected file name */}
          {fileName && (
            <div className="mt-2 text-sm text-gray-500">
              {fileName}{" "}
              {selectedFile && (
                <span>({formatFileSize(selectedFile.size)})</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PremiumWindInputs;
