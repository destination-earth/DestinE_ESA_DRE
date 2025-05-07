import React from "react";
import CoordinateInputs from "../commonFormComponents/CoordinateInputs";
import HubHeightInput from "../commonFormComponents/HubHeightInput";
import FloatingLabelInput from "../commonFormComponents/FloatingLabelInput";
import FloatingLabelSelect from "../commonFormComponents/FloatingLabelSelect";
import ValidatedInput, { ValidatedInputRef } from "../../services/validation/formValidation/ValidatedInput";
import MapSelector from "../mapSelectorComponent/MapSelector";
import WindTemplateUpload from "../fileHandling/WindTemplateUpload";
import SolarTemplateUpload from "../fileHandling/solarTemplateUpload";
import Card from "../ui/Card";
import { TemplateType } from "../../utils/templateUtils";

// Common fields interface for both standard and train forecasts
interface CommonFormFields {
  latitude: string;
  longitude: string;
  elevation: string;
}

// Wind-specific fields
interface WindFields {
  hubHeight: string;
  powerCurveModel: string;
  powerCurveFile?: File | null;
}

// Solar-specific fields
interface SolarFields {
  tilt: string;
  azimuth: string;
  tracking: string;
  capacity: string;
}

// Train-specific fields
interface TrainFields {
  file?: File | null;
}

type FormDataType = CommonFormFields & Partial<WindFields & SolarFields & TrainFields>;

interface ForecastInputsLayoutProps {
  // Form type and energy type
  formType: "standard" | "train";
  energyType: "solar" | "wind";
  
  // Form data
  formData: FormDataType;
  resetMap: boolean;
  
  // Event handlers
  handleInputChange: (field: string) => (value: string | File | null) => void;
  handleMapSelect?: (lat: string, lng: string) => void;
  
  // Validation functions
  validateRequired?: (value: string) => boolean;
  validateLatitudeFormat?: (value: string) => boolean;
  validateLongitudeFormat?: (value: string) => boolean;
  validateElevation?: (value: string) => boolean;
  validateHubHeight?: (value: string) => boolean;
  validateTilt?: (value: string) => boolean;
  validateAzimuth?: (value: string) => boolean;
  validatePositiveNumber?: (value: string) => boolean;
  
  // Refs for form fields
  getFieldRef: (field: string) => React.RefObject<ValidatedInputRef>;
  
  // Additional handlers for power curve and file uploads
  handlePowerCurveChange?: (value: string) => void;
  handlePowerCurveFileUpload?: (file: File | null) => void;
  handleSolarTemplateUpload?: (file: File | null) => void;
  handleWindTemplateUpload?: (file: File | null) => void;
  handleDownloadSolarTemplate?: () => void;
  handleDownloadWindTemplate?: () => void;
  
  // Form reset state
  formReset: boolean;
  
  // Files
  powerCurveFile?: File | null;
  templateFile?: File | null;
  
  // Validation props (optional, primarily for solar train)
  onValidate?: () => void;
  isValidationLoading?: boolean;
  validationErrorMsg?: string | null;
  isFileValidated?: boolean;
}

const ForecastInputsLayout: React.FC<ForecastInputsLayoutProps> = ({
  formType,
  energyType,
  formData,
  resetMap,
  handleInputChange,
  handleMapSelect,
  validateRequired = () => true,
  validateLatitudeFormat = () => true,
  validateLongitudeFormat = () => true,
  validateElevation = () => true,
  validateHubHeight = () => true,
  validateTilt = () => true,
  validateAzimuth = () => true,
  validatePositiveNumber = () => true,
  getFieldRef,
  handlePowerCurveChange,
  handlePowerCurveFileUpload,
  handleSolarTemplateUpload,
  handleWindTemplateUpload,
  // These handlers are defined but not used - keeping them in the interface for future use
  // handleDownloadSolarTemplate,
  // handleDownloadWindTemplate,
  formReset,
  powerCurveFile,
  templateFile,
  onValidate,
  isValidationLoading = false, // Default to false
  validationErrorMsg = null,  // Default to null
  isFileValidated = false     // Default to false
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
    <>
      {/* Main layout with Map and Basic Inputs */}
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
          
          {/* File upload section under the map */}
          {formType === "train" && (
            <div className="mt-4">
              {effectiveEnergyType === "solar" && handleSolarTemplateUpload && (
                <SolarTemplateUpload
                  onFileUpload={handleSolarTemplateUpload}
                  shouldReset={formReset} 
                  // Pass validation props down
                  onValidate={onValidate ?? (() => {})} 
                  isValidationLoading={isValidationLoading}
                  validationErrorMsg={validationErrorMsg}
                  isFileValidated={isFileValidated}
                  templateType={TemplateType.TRAIN_DATA}
                />
              )}
              
              {effectiveEnergyType === "wind" && handleWindTemplateUpload && (
                <WindTemplateUpload
                  onFileUpload={handleWindTemplateUpload}
                  shouldReset={formReset}
                  templateType={TemplateType.TRAIN_DATA}
                />
              )}
            </div>
          )}
          
          {/* Power curve file upload under the map for wind standard forecast */}
          {effectiveEnergyType === "wind" && 
           formType === "standard" && 
           formData.powerCurveModel === "upload_custom" && 
           handlePowerCurveFileUpload && (
            <div className="mt-4">
              <WindTemplateUpload 
                onFileUpload={handlePowerCurveFileUpload}
                shouldReset={formReset}
                templateType={TemplateType.POWER_CURVE}
                title="Power Curve Upload"
                description="Upload your custom power curve file. This will be used to calculate the power output based on wind speed data."
                uploadPrompt="Click or drag file to this area to upload your power curve data"
                // Pass validation props
                onValidate={onValidate}
                isValidationLoading={isValidationLoading}
                validationErrorMsg={validationErrorMsg}
                isFileValidated={isFileValidated}
                showValidateButton={true}
              />
            </div>
          )}
        </div>

        {/* Right column - Form inputs (1/4 of grid) */}
        <div className="mx-4 md:col-span-1">
          <div className="pb-4">
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

            {/* Elevation input - Only for solar energy type */}
            {effectiveEnergyType === "solar" && (
              <div className="mb-20">
                <FloatingLabelInput
                  id="elevation"
                  label="Elevation (m)"
                >
                  <ValidatedInput
                    id="elevation"
                    type="number"
                    value={formData.elevation}
                    onChange={handleInputChange("elevation")}
                    validate={validateElevation}
                    errorMessage="Elevation must be a valid number between 0 and 8849"
                    placeholder="Enter elevation"
                    className="h-16 w-full border-2 p-2 pt-4 text-gray-500 focus:outline-none focus:ring-0"
                    ref={getFieldRef("elevation")}
                  />
                </FloatingLabelInput>
              </div>
            )}

            {/* Wind-specific inputs */}
            {effectiveEnergyType === "wind" && (
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

                {formType === "standard" && (
                  <div className="mb-20">
                    <FloatingLabelSelect
                      id="powerCurveModel"
                      label="Power Curve Models"
                      value={formData.powerCurveModel || ""}
                      onChange={(value: string) => {
                        handleInputChange("powerCurveModel")(value);
                        if (handlePowerCurveChange) {
                          handlePowerCurveChange(value);
                        }
                      }}
                      options={[
                        {
                          value: "upload_custom",
                          label: "Upload Your Power Curve",
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
                )}
                
                {/* Capacity input for wind */}
                <div className="mb-20">
                  <FloatingLabelInput
                    id="capacity"
                    label="Capacity (kW)"
                  >
                    <ValidatedInput
                      id="capacity"
                      type="number"
                      value={formData.capacity || ""}
                      onChange={handleInputChange("capacity")}
                      validate={validatePositiveNumber}
                      errorMessage="Capacity must be a positive number"
                      placeholder="Enter capacity (kW)"
                      className="h-16 w-full border-2 p-2 pt-4 text-gray-500 focus:outline-none focus:ring-0"
                      ref={getFieldRef("capacity")}
                    />
                  </FloatingLabelInput>
                </div>
              </>
            )}
            
            {/* Capacity input for solar train forecast */}
            {effectiveEnergyType === "solar" && formType === "train" && (
              <div className="mb-20">
                <FloatingLabelInput
                  id="capacity"
                  label="Capacity (kW)"
                >
                  <ValidatedInput
                    id="capacity"
                    type="number"
                    value={formData.capacity || ""}
                    onChange={handleInputChange("capacity")}
                    validate={validatePositiveNumber}
                    errorMessage="Capacity must be a positive number"
                    placeholder="Enter capacity (kW)"
                    className="h-16 w-full border-2 p-2 pt-4 text-gray-500 focus:outline-none focus:ring-0"
                    ref={getFieldRef("capacity")}
                  />
                </FloatingLabelInput>
              </div>
            )}

            {/* Display selected template file for train forecast */}
            {formType === "train" && templateFile && (
              <div className="mt-2 text-sm text-green-600">
                <span className="font-medium">Selected file:</span>{" "}
                {templateFile.name}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Second Card for Solar-specific fields - Displayed below the main grid */}
      {effectiveEnergyType === "solar" && formType === "standard" && (
        <Card className="mt-6 py-12">
          <div className="flex flex-col space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Tilt */}
              <div className="w-full">
                <FloatingLabelInput
                  id="tilt"
                  label="Tilt (°)"
                >
                  <ValidatedInput
                    id="tilt"
                    type="number"
                    value={formData.tilt || ""}
                    onChange={handleInputChange("tilt")}
                    validate={validateTilt}
                    errorMessage="Tilt must be between 0 and 90 degrees"
                    placeholder="Enter tilt (0-90°)"
                    className="h-16 w-full border-2 p-2 pt-4 text-gray-500 focus:outline-none focus:ring-0"
                    ref={getFieldRef("tilt")}
                  />
                </FloatingLabelInput>
              </div>

              {/* Azimuth */}
              <div className="w-full">
                <FloatingLabelInput
                  id="azimuth"
                  label="Azimuth (°)"
                >
                  <ValidatedInput
                    id="azimuth"
                    type="number"
                    value={formData.azimuth || ""}
                    onChange={handleInputChange("azimuth")}
                    validate={validateAzimuth}
                    errorMessage="Azimuth must be between 0 and 360 degrees"
                    placeholder="Enter azimuth (0-360°)"
                    className="h-16 w-full border-2 p-2 pt-4 text-gray-500 focus:outline-none focus:ring-0"
                    ref={getFieldRef("azimuth")}
                  />
                </FloatingLabelInput>
              </div>

              {/* Tracking */}
              <div className="w-full">
                <FloatingLabelSelect
                  id="tracking"
                  label="Tracking"
                  value={formData.tracking || "0"}
                  onChange={handleInputChange("tracking")}
                  options={[
                    { value: "0", label: "Fixed" },
                    { value: "1", label: "Single Axis" },
                    { value: "2", label: "Dual Axis" },
                  ]}
                  placeholder="Fixed"
                />
              </div>

              {/* Capacity */}
              <div className="w-full">
                <FloatingLabelInput
                  id="capacity"
                  label="Capacity (kW)"
                >
                  <ValidatedInput
                    id="capacity"
                    type="number"
                    value={formData.capacity || ""}
                    onChange={handleInputChange("capacity")}
                    validate={validatePositiveNumber}
                    errorMessage="Capacity must be a positive number"
                    placeholder="Enter capacity (kW)"
                    className="h-16 w-full border-2 p-2 pt-4 text-gray-500 focus:outline-none focus:ring-0"
                    ref={getFieldRef("capacity")}
                  />
                </FloatingLabelInput>
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default ForecastInputsLayout;
