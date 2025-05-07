import React from "react";
import DateRangeInputs from "../commonFormComponents/DateRangeInputs";
import CoordinateInputs from "../commonFormComponents/CoordinateInputs";
import HubHeightInput from "../commonFormComponents/HubHeightInput";
import FloatingLabelSelect from "../commonFormComponents/FloatingLabelSelect";
import { ValidatedInputRef } from "../../services/validation/formValidation/ValidatedInput";
import MapSelector from "../mapSelectorComponent/MapSelector";
import BasicWindInputs from "./sourceSpecificFormComponents/BasicWindInputs";
import WindTemplateUpload from "../fileHandling/WindTemplateUpload";
import { TemplateType } from "../../utils/templateUtils";

// Common fields interface for both basic and premium assessments
interface CommonFormFields {
  startDate: string;
  endDate: string;
  latitude: string;
  longitude: string;
}

// Wind-specific fields for basic assessment
interface BasicWindFields {
  height?: string;
}

// Wind-specific fields for premium assessment
interface PremiumWindFields {
  hubHeight: string;
  powerCurveModel: string;
  powerCurveFile?: File | null;
}

// Solar-specific fields for premium assessment
interface PremiumSolarFields {
  tilt: string;
  azimuth: string;
  tracking: string;
  capacity: string;
}

type FormDataType = CommonFormFields & Partial<BasicWindFields & PremiumWindFields & PremiumSolarFields>;

interface AssessmentInputsLayoutProps {
  // Form type and energy type
  formType?: "basic" | "premium";
  energyType: "solar" | "wind";
  
  // Form data and key for resetting
  formData: FormDataType;
  formKey?: number;
  
  // Map state
  resetMap: boolean;
  
  // Input handlers
  handleInputChange: (field: string) => (value: string) => void;
  handleMapSelect?: (lat: string, lng: string) => void;
  
  // Validation functions
  validateDate?: (value: string, energyType: "solar" | "wind") => boolean;
  validateEndDate?: (startDate: string, endDate: string, energyType: "solar" | "wind") => boolean;
  validateRequired?: (value: string) => boolean;
  validateLatitudeFormat?: (value: string) => boolean;
  validateLongitudeFormat?: (value: string) => boolean;
  
  // Refs for validation
  getFieldRef: (field: string) => React.RefObject<ValidatedInputRef>;
  
  // Optional premium-specific validators
  validateHubHeight?: (value: string) => boolean;
  validateTilt?: (value: string) => boolean;
  validateAzimuth?: (value: string) => boolean;
  validateNumber?: (value: string) => boolean;
  
  // Optional premium-specific handlers
  handlePowerCurveChange?: (value: string) => void;
  handlePowerCurveFileUpload?: (file: File | null) => void;
  handleDownloadTemplate?: () => void;
  formReset?: boolean;
  powerCurveFile?: File | null;
  
  // Wind validation props
  windValidationStatus?: "idle" | "validating" | "success" | "error";
  windValidationMessage?: string;
  onValidateWindFiles?: () => Promise<{success: boolean}>;
}

const AssessmentInputsLayout: React.FC<AssessmentInputsLayoutProps> = ({
  formType = "basic",
  energyType,
  formData,
  formKey = 1,
  resetMap,
  handleInputChange,
  handleMapSelect,
  validateDate = () => true,
  validateEndDate = () => true,
  validateRequired = () => true,
  validateLatitudeFormat = () => true,
  validateLongitudeFormat = () => true,
  getFieldRef,
  validateHubHeight,
  validateTilt,
  validateAzimuth,
  validateNumber,
  handlePowerCurveChange,
  handlePowerCurveFileUpload,
  handleDownloadTemplate,
  formReset,
  powerCurveFile,
  windValidationStatus,
  windValidationMessage,
  onValidateWindFiles
}) => {
  // Determine the effective energy type (use the provided value or default to "solar")
  const effectiveEnergyType = energyType || "solar";
  
  // Handle map coordinate changes
  const onMapCoordinateChange = (lat: string, lng: string) => {
    if (handleMapSelect) {
      handleMapSelect(lat, lng);
    } else {
      handleInputChange("latitude")(lat);
      handleInputChange("longitude")(lng);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Left column - Map (3/4 of grid) */}
      <div className="md:col-span-3">
        <div className="h-[400px] md:h-[500px]">
          <MapSelector
            latitude={formData.latitude}
            longitude={formData.longitude}
            onCoordinateChange={onMapCoordinateChange}
            resetMap={resetMap}
          />
        </div>
        
        {/* Power curve file upload under the map */}
        {effectiveEnergyType === "wind" && 
         formType === "premium" && 
         formData.powerCurveModel === "upload_custom" && 
         handlePowerCurveFileUpload && 
         handleDownloadTemplate && (
          <div className="mt-4">
            <WindTemplateUpload 
              onFileUpload={handlePowerCurveFileUpload}
              onDownloadTemplate={handleDownloadTemplate}
              shouldReset={formReset}
              title="Power Curve Upload"
              description="Upload your custom power curve using our CSV template. This will be used to calculate the power output based on wind speed."
              uploadPrompt="Click or drag file to this area to upload your power curve"
              downloadPrompt="Need a template? Download here:"
              downloadButtonText="DOWNLOAD POWER CURVE TEMPLATE"
              templateType={TemplateType.POWER_CURVE}
              // Validation props
              onValidate={onValidateWindFiles}
              isValidationLoading={windValidationStatus === "validating"}
              validationErrorMsg={windValidationStatus === "error" ? windValidationMessage : null}
              isFileValidated={windValidationStatus === "success"}
              showValidateButton={true}
            />
          </div>
        )}
      </div>

      {/* Right column - Form inputs (1/4 of grid) */}
      <div className="mx-4 md:col-span-1">
        <div className="pb-4">
          {/* Date inputs - Consistent spacing */}
          <div className="mb-20">
            <DateRangeInputs
              key={`date-inputs-${formKey}`}
              startDate={formData.startDate}
              endDate={formData.endDate}
              onStartDateChange={handleInputChange("startDate")}
              onEndDateChange={handleInputChange("endDate")}
              validateStartDate={(value) =>
                validateDate(value, effectiveEnergyType)
              }
              validateEndDate={(startDate, endDate) =>
                validateEndDate(startDate, endDate, effectiveEnergyType)
              }
              energyType={effectiveEnergyType}
            />
          </div>

          {/* Coordinate inputs - Consistent spacing */}
          <div className="mb-20">
            <CoordinateInputs
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLatitudeChange={handleInputChange("latitude")}
              onLongitudeChange={handleInputChange("longitude")}
              validateLatitude={(value) =>
                validateRequired(value) && validateLatitudeFormat(value)
              }
              validateLongitude={(value) =>
                validateRequired(value) &&
                validateLongitudeFormat(value)
              }
              containerClassName="space-y-8"
              latitudeRef={getFieldRef("latitude")}
              longitudeRef={getFieldRef("longitude")}
            />
          </div>

          {/* Wind-specific inputs for Basic assessment */}
          {effectiveEnergyType === "wind" && formType === "basic" && (
            <div className="mb-8">
              <BasicWindInputs
                height={formData.height || ""}
                onHeightChange={handleInputChange("height")}
                heightRef={getFieldRef("height")}
              />
            </div>
          )}

          {/* Wind-specific inputs for Premium assessment */}
          {effectiveEnergyType === "wind" && formType === "premium" && validateHubHeight && (
            <>
              <div className="mb-20">
                <HubHeightInput
                  value={formData.hubHeight || ""}
                  onChange={handleInputChange("hubHeight")}
                  validate={validateHubHeight}
                  inputRef={getFieldRef("hubHeight")}
                  errorMessage="Hub height must be between 40 and 300 meters"
                />
              </div>

              <div className="mb-8">
                <FloatingLabelSelect
                  id="powerCurveModel"
                  label="Power Curve Models"
                  value={formData.powerCurveModel || ""}
                  onChange={(value: string) => {
                    // Only call the specific handler passed down from PremiumTab
                    if (handlePowerCurveChange) {
                      handlePowerCurveChange(value);
                    }
                  }}
                  options={[
                    {
                      value: "upload_custom",
                      label: "Upload Power Curve",
                    },
                    {
                      value: "Vestas_V112_3000_Offshore",
                      label: "Vestas_V112_3000_Offshore",
                    },
                    {
                      value: "Vestas_V112_3000_Onshore",
                      label: "Vestas_V112_3000_Onshore",
                    },
                  ]}
                  placeholder="Select model"
                />
                {powerCurveFile && (
                  <div className="mt-2 text-sm text-green-600">
                    <span className="font-medium">Selected file:</span>{" "}
                    {powerCurveFile.name}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Solar-specific inputs for Premium assessment */}
          {effectiveEnergyType === "solar" && formType === "premium" && validateTilt && validateAzimuth && validateNumber && (
            <div className="mb-8">
              {/* Premium Solar inputs would go here */}
              {/* This would typically include tilt, azimuth, tracking, and capacity inputs */}
              {/* For brevity, I'm not implementing the full PremiumSolarInputs component here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentInputsLayout;
