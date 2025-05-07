import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Card from "../ui/Card";
import {
  ValidatedInputRef,
} from "../../services/validation/formValidation/ValidatedInput";
import FormActions from "../commonFormComponents/FormActions";
import {
  validateLatitudeFormat,
  validateLongitudeFormat,
  validateElevation,
  validateAzimuth,
  validateTilt,
  validatePositiveNumber,
  validateHubHeight,
} from "../../services/validation/validators";
import { 
  useStandardForecastMutation,
  StandardSolarForecastParams,
  StandardWindForecastParams,
  useValidateWindFilesMutation
} from "../../hooks/useForecastQueries";
import { ValidateWindFilesParams, FileValidationResult } from "../../types/forecastValidationTypes";
import ForecastInputsLayout from "./ForecastInputsLayout";

interface StandardForecastFormProps {
  energyType: "solar" | "wind";
  formData: {
    latitude: string;
    longitude: string;
    elevation: string;
    azimuth: string;
    tilt: string;
    tracking: string;
    capacity: string;
    hubHeight?: string;
    powerCurveModel?: string;
  };
  onInputChange: (field: string) => (value: string) => void;
  onClear: () => void;
  onSubmit: (orderId?: string, energyType?: "solar" | "wind") => void;
  sourceTab?: "oneoff" | "annual";
}

const StandardForecastForm: React.FC<StandardForecastFormProps> = ({
  energyType,
  formData,
  onInputChange,
  onClear,
  onSubmit,
  sourceTab = "oneoff",
}) => {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isSubmittingRef = useRef(false);
  const [powerCurveFile, setPowerCurveFile] = useState<File | null>(null);
  const [resetMap, setResetMap] = useState(false);
  
  // Power curve validation states
  const [powerCurveValidationMessage, setPowerCurveValidationMessage] = useState<string | null>(null);
  const [validatedGuid, setValidatedGuid] = useState<string>('');
  const [validatedAux, setValidatedAux] = useState<string>('');

  // Add refs for ValidatedInput components
  const latitudeRef = useRef<ValidatedInputRef>(null);
  const longitudeRef = useRef<ValidatedInputRef>(null);
  const elevationRef = useRef<ValidatedInputRef>(null);
  const tiltRef = useRef<ValidatedInputRef>(null);
  const azimuthRef = useRef<ValidatedInputRef>(null);
  const hubHeightRef = useRef<ValidatedInputRef>(null);
  const capacityRef = useRef<ValidatedInputRef>(null);

  // Reference to track initial render
  const isInitialMount = useRef(true);

  // Wind validation hooks
  const {
    validateWindFiles,
    isWindValidationLoading,
    resetWindValidation,
  } = useValidateWindFilesMutation<FileValidationResult>();

  // Use the standard forecast mutation hook
  const {
    submitForecast,
    isSubmitting,
  } = useStandardForecastMutation(
    energyType,
    sourceTab,
    (orderId, energyType) => {
      // Reset submission tracking
      isSubmittingRef.current = false;
      
      // Call the onSubmit callback from props
      if (onSubmit) {
        onSubmit(orderId, energyType);
      }
      
      // Clear the form
      handleClear();
      
      // Set submitted state to show success message
      setIsSubmitted(true);
    }
  );

  // Force power curve model to empty on initial render
  useEffect(() => {
    if (
      isInitialMount.current &&
      energyType === "wind" &&
      formData.powerCurveModel === "0"
    ) {
      // Only reset if it's the default "0" value, not if user selected it
      onInputChange("powerCurveModel")("");
      isInitialMount.current = false;
    }
  }, [formData.powerCurveModel, onInputChange, energyType]);

  // Reset isSubmitted state when form data changes
  useEffect(() => {
    // If any form field has a value and the form was previously submitted,
    // reset the submitted state to allow re-submission
    if (
      isSubmitted &&
      (formData.latitude !== "" ||
        formData.longitude !== "" ||
        formData.capacity !== "")
    ) {
      setIsSubmitted(false);
    }
  }, [formData, isSubmitted]);

  // Memoize the form validation to prevent unnecessary re-renders
  const validateFormInternal = useCallback(() => {
    // Basic validations for both energy types
    const isLatitudeValid = validateLatitudeFormat(formData.latitude);
    const isLongitudeValid = validateLongitudeFormat(formData.longitude);
    const isCapacityValid = validatePositiveNumber(formData.capacity);

    // Common validation for both energy types
    let isValid = isLatitudeValid && isLongitudeValid && isCapacityValid;

    // Additional validations based on energy type
    if (energyType === "solar") {
      // Solar-specific validations
      const isElevationValid = validateElevation(formData.elevation || "");
      const isAzimuthValid = validateAzimuth(formData.azimuth || "");
      const isTiltValid = validateTilt(formData.tilt || "");
      const isCapacityValid = validatePositiveNumber(formData.capacity || "");

      isValid = isValid && isElevationValid && isAzimuthValid && isTiltValid && isCapacityValid;
    } else if (energyType === "wind") {
      // Wind-specific validations - only check hub height, not elevation
      const isHubHeightValid = validateHubHeight(
        formData.hubHeight || "",
      );

      // Check if power curve model is selected
      const isPowerCurveModelSelected =
        !!formData.powerCurveModel && formData.powerCurveModel !== "";
      
      // Check if a power curve file is required and present
      const isPowerCurveFileRequired = formData.powerCurveModel === "upload_custom";
      const isPowerCurveFileValid = !isPowerCurveFileRequired || !!powerCurveFile;
      
      // SIMPLIFIED VALIDATION LOGIC:
      // For custom power curve: require validation only if a file is uploaded
      // For standard power curve models: no validation required
      let isPowerCurveValidationComplete = true;
      
      if (isPowerCurveFileRequired && powerCurveFile) {
        // Only require validation for custom power curve with file
        isPowerCurveValidationComplete = validatedGuid !== '';
      }
      
      // Log validation status for debugging
      console.log("Power curve validation status:", {
        isPowerCurveFileRequired,
        isPowerCurveFileValid,
        isPowerCurveValidationComplete,
        validatedGuid,
        powerCurveValidationMessage,
        isValid
      });

      // Only require hub height and power curve model for wind
      isValid = isValid && isHubHeightValid && isPowerCurveModelSelected && isPowerCurveFileValid && isPowerCurveValidationComplete;

      // Log validation state for debugging
      console.log("Wind standard validation state:", {
        isLatitudeValid,
        isLongitudeValid,
        isCapacityValid,
        isHubHeightValid,
        isPowerCurveModelSelected,
        isPowerCurveFileRequired,
        isPowerCurveFileValid,
        isPowerCurveValidationComplete,
        isValid,
      });
    }

    return isValid;
  }, [formData, energyType, powerCurveFile, validatedGuid, powerCurveValidationMessage]);

  // Use the internal validation or the parent's validation based on what's available
  const effectiveIsFormValid = useMemo(() => {
    const isValid = validateFormInternal();
    console.log("Form validation result:", { isValid, validatedGuid });
    return isValid;
  }, [validateFormInternal, validatedGuid]);

  // Validate form when formData changes
  useEffect(() => {
    validateFormInternal();
  }, [validateFormInternal]);

  const handleSubmit = () => {
    // Prevent duplicate submissions if a mutation is already in progress
    if (isSubmitting || isSubmittingRef.current || isSubmitted) {
      console.log("Preventing duplicate submission - already in progress or already submitted");
      return;
    }

    // Explicitly validate latitude and longitude
    const isLatitudeValid = validateLatitudeFormat(formData.latitude);
    const isLongitudeValid = validateLongitudeFormat(formData.longitude);
    
    if (!isLatitudeValid || !isLongitudeValid) {
      console.log("Form submission blocked: Invalid coordinates", {
        latitude: formData.latitude,
        longitude: formData.longitude,
        isLatitudeValid,
        isLongitudeValid
      });
      
      // Show an alert to the user about invalid coordinates
      alert("Please ensure latitude and longitude are in the correct format using decimal points (.) instead of commas.");
      
      return;
    }

    // Set submission flag at the beginning
    isSubmittingRef.current = true;

    // Only proceed if the form is valid and not already submitting
    if (effectiveIsFormValid && !isSubmitting && !isSubmitted) {
      console.log("StandardForecastForm: Starting forecast submission");
      isSubmittingRef.current = true;

      // Prepare parameters based on energy type
      if (energyType === "solar") {
        const solarParams: StandardSolarForecastParams = {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          elevation: parseFloat(formData.elevation),
          azimuth: parseFloat(formData.azimuth),
          tilt: parseFloat(formData.tilt),
          tracking:
            formData.tracking === "fixed"
              ? 0
              : formData.tracking === "single_axis"
                ? 1
                : 2,
          capacity: parseFloat(formData.capacity),
        };
        submitForecast(solarParams);
      } else {
        const windParams: StandardWindForecastParams = {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          elevation: 0, // Set elevation to 0 for wind submissions
          hubHeight: parseFloat(formData.hubHeight || "0"),
          powerCurveModel: formData.powerCurveModel || "",
          startDate: new Date().toISOString(),
          endDate: new Date(
            new Date().setDate(new Date().getDate() + 7),
          ).toISOString(), // 7 days forecast
          capacity: parseFloat(formData.capacity),
        };
        
        // Use validation data if available, otherwise empty strings
        const enhancedParams = {
          ...windParams,
          guid: validatedGuid || '',
          aux: validatedAux || ''
        };
        console.log("Submitting wind forecast with guid and aux:", enhancedParams);
        submitForecast(enhancedParams);
      }
    } else {
      console.log(
        "StandardForecastForm: Form validation failed or mutation is pending",
        {
          isFormValid: effectiveIsFormValid,
          isPending: isSubmitting,
          isSubmitted,
        },
      );
    }
  };

  const handleClear = useCallback(() => {
    // Reset power curve file state
    setPowerCurveFile(null);
    
    // Trigger map reset
    setResetMap(true);
    
    // Reset map flag after a short delay
    setTimeout(() => {
      setResetMap(false);
    }, 100);
    
    // Call the parent's onClear function
    onClear();
    
    // Reset validation state after a small delay to ensure form data is cleared
    setTimeout(() => {
      latitudeRef.current?.resetValidation();
      longitudeRef.current?.resetValidation();
      elevationRef.current?.resetValidation();
      azimuthRef.current?.resetValidation();
      tiltRef.current?.resetValidation();
      capacityRef.current?.resetValidation();
      hubHeightRef.current?.resetValidation();
    }, 50);
  }, [onClear]);

  // Power curve validation handler
  const handleValidatePowerCurve = useCallback(() => {
    // Check if we have a power curve file
    if (!powerCurveFile) {
      setPowerCurveValidationMessage("Power curve file is required for validation.");
      return;
    }

    // Clear previous validation state
    setPowerCurveValidationMessage(null);
    setValidatedGuid('');
    setValidatedAux('');
    if (resetWindValidation) {
      resetWindValidation();
    }

    // Prepare validation parameters
    const validationParams: ValidateWindFilesParams = {
      templateFile: powerCurveFile, // Use power curve file as the main file
      powerCurveFile: null, // No secondary file needed
      plan: sourceTab, // Use the current tab (oneoff or annual)
      powerCurveModel: formData.powerCurveModel || "",
      type: "standard" // Specify this is for standard form
    };

    console.log("Validating power curve file with params:", validationParams);

    // Call the validation API
    if (validateWindFiles) {
      validateWindFiles(validationParams, {
        onSuccess: (data: FileValidationResult) => {
          console.log("Power Curve Validation Success:", data);
          if (data.valid && data.file_path) {
            setPowerCurveValidationMessage(data.message || "File validated successfully.");
            
            // Store validation data for submission
            setValidatedGuid(data.guid || '');
            setValidatedAux(data.aux || '');
            
            console.log("Power curve validation data:", {
              guid: data.guid,
              aux: data.aux,
              valid: data.valid,
              file_path: data.file_path
            });
            
            // Force re-render to update form validation
            setValidatedGuid(data.guid || '');
            setValidatedAux(data.aux || '');
            
            // Force form validation to run again
            setTimeout(() => {
              const isValid = validateFormInternal();
              console.log("Form validation after successful validation:", { isValid });
            }, 100);
          } else {
            setPowerCurveValidationMessage(data.message || "Power curve file validation failed. Please check the file.");
            setValidatedGuid('');
            setValidatedAux('');
          }
        },
        onError: (error: Error) => {
          console.error("Power curve validation API call failed:", error);
          setPowerCurveValidationMessage(`Validation request failed: ${error.message || "Unknown error"}`);
          setValidatedGuid('');
          setValidatedAux('');
        },
      });
    } else {
      console.error("validateWindFiles mutation function is not available.");
      setPowerCurveValidationMessage("Validation setup error. Please try again later.");
      setValidatedGuid('');
      setValidatedAux('');
    }
  }, [
    powerCurveFile,
    formData.powerCurveModel,
    sourceTab,
    validateWindFiles,
    resetWindValidation,
    // validatedGuid,
    // powerCurveValidationMessage,
    validateFormInternal, // Added missing dependency
  ]);

  // Reset validation state when power curve file changes
  useEffect(() => {
    if (powerCurveFile) {
      // Reset validation state when a new file is selected
      setPowerCurveValidationMessage(null);
      setValidatedGuid('');
      setValidatedAux('');
    }
  }, [powerCurveFile]);

  const handleMapSelect = (lat: string, lng: string) => {
    // Update latitude
    onInputChange('latitude')(lat);
    
    // Update longitude
    onInputChange('longitude')(lng);
    
    // Validate form after updating coordinates
    validateFormInternal();
  };

  const handlePowerCurveModelChange = (value: string) => {
    onInputChange("powerCurveModel")(value);

    // If custom option is selected, prompt for file upload
    if (value === "upload_custom") {
      document.getElementById("powerCurveFileInput")?.click();
    }
    
    // Reset validation state when model changes
    setPowerCurveValidationMessage(null);
    setValidatedGuid('');
    setValidatedAux('');
  };

  return (
    <div className="space-y-8">
      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <ForecastInputsLayout
            formType="standard"
            energyType={energyType}
            formData={formData}
            resetMap={resetMap}
            handleInputChange={(field) => (value) => {
              // Handle both string and File types
              if (typeof value === 'string') {
                onInputChange(field)(value);
              } else if (field === 'powerCurveFile' && value instanceof File) {
                setPowerCurveFile(value);
              }
            }}
            handleMapSelect={handleMapSelect}
            handlePowerCurveChange={handlePowerCurveModelChange}
            handlePowerCurveFileUpload={(file) => {
              setPowerCurveFile(file);
              // Reset validation state when file changes
              setPowerCurveValidationMessage(null);
              setValidatedGuid('');
              setValidatedAux('');
            }}
            handleDownloadWindTemplate={() => {
              console.log("Download template clicked");
            }}
            // Add validation props for power curve file
            onValidate={formData.powerCurveModel === "upload_custom" ? handleValidatePowerCurve : undefined}
            isValidationLoading={isWindValidationLoading}
            validationErrorMsg={powerCurveValidationMessage}
            isFileValidated={validatedGuid !== ''}
            validateRequired={(value) => !!value}
            validateLatitudeFormat={validateLatitudeFormat}
            validateLongitudeFormat={validateLongitudeFormat}
            validateElevation={validateElevation}
            validateHubHeight={validateHubHeight}
            validateTilt={validateTilt}
            validateAzimuth={validateAzimuth}
            validatePositiveNumber={validatePositiveNumber}
            getFieldRef={(field) => {
              switch (field) {
                case "latitude":
                  return latitudeRef;
                case "longitude":
                  return longitudeRef;
                case "elevation":
                  return elevationRef;
                case "tilt":
                  return tiltRef;
                case "azimuth":
                  return azimuthRef;
                case "hubHeight":
                  return hubHeightRef;
                case "capacity":
                  return capacityRef;
                default:
                  return latitudeRef; // Default fallback
              }
            }}
            formReset={false}
            powerCurveFile={powerCurveFile}
          />
        </form>
      </Card>

      {/* Form Action Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <FormActions
          onClear={handleClear}
          onSubmit={handleSubmit}
          isSubmitDisabled={!effectiveIsFormValid || isSubmitting}
          submitButtonText={
            isSubmitting
              ? t("forecast.common.button.sending", "SENDING...")
              : t("forecast.common.button.send", "SEND")
          }
        />
      </div>
    </div>
  );
};

export default StandardForecastForm;
