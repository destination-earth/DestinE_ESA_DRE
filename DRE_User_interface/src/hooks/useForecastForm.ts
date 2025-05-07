import { useState, useCallback } from "react";
import {
  validateLatitude,
  validateLongitude,
  validateElevation,
  validateAzimuth,
  validateTilt,
  validatePositiveNumber,
  validateHubHeight,
} from "../services/validation/validators";

// Define the form data interface
export interface ForecastFormData {
  latitude: string;
  longitude: string;
  elevation: string;
  tilt: string;
  azimuth: string;
  tracking: string;
  capacity: string;
  hubHeight: string;
  powerCurveModel: string;
  file: File | null;
}

export type ForecastFormMode = "train" | "standard";
export type ForecastSourceTab = "oneoff" | "annual";

interface UseForecastFormOptions {
  energyType: "solar" | "wind";
  formMode: ForecastFormMode;
  sourceTab: ForecastSourceTab;
}

export function useForecastForm({
  energyType,
  formMode,
  sourceTab,
}: UseForecastFormOptions) {
  // Initialize form data with default values
  const [formData, setFormData] = useState<ForecastFormData>({
    latitude: "",
    longitude: "",
    elevation: "",
    tilt: "",
    azimuth: "",
    tracking: "fixed",
    capacity: "",
    hubHeight: "",
    powerCurveModel: "",
    file: null,
  });

  // Add a key state to force re-render of child components when needed
  const [formKey, setFormKey] = useState<number>(0);

  // Handle input changes
  const handleInputChange = useCallback(
    (field: string) => (value: string | File | null) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Clear form data
  const handleClear = useCallback(() => {
    setFormData({
      latitude: "",
      longitude: "",
      elevation: "",
      tilt: "",
      azimuth: "",
      tracking: "fixed",
      capacity: "",
      hubHeight: "",
      powerCurveModel: "",
      file: null,
    });

    // Force re-render of child components
    setFormKey((prevKey) => prevKey + 1);
  }, []);

  // Validate form based on energy type and form mode
  const validateForm = useCallback(() => {
    // Basic validations for both energy types
    const isLatitudeValid = validateLatitude(formData.latitude);
    const isLongitudeValid = validateLongitude(formData.longitude);

    // Common validation for both energy types
    let isValid = isLatitudeValid && isLongitudeValid;

    // Additional validations based on energy type
    if (energyType === "solar") {
      // Solar-specific validations
      const isElevationValid = validateElevation(formData.elevation);
      
      // For standard mode, validate additional fields
      if (formMode === "standard") {
        const isAzimuthValid = validateAzimuth(formData.azimuth);
        const isTiltValid = validateTilt(formData.tilt);
        isValid = isValid && isElevationValid && isAzimuthValid && isTiltValid;
      } else {
        isValid = isValid && isElevationValid;
      }
    } else if (energyType === "wind") {
      // Wind-specific validations
      if (formMode === "standard") {
        const isHubHeightValid = validateHubHeight(formData.hubHeight);
        isValid = isValid && isHubHeightValid;
      }
    }

    // For standard mode, capacity is required
    if (formMode === "standard") {
      isValid = isValid && validatePositiveNumber(formData.capacity);
    }

    // For train mode, file is required
    if (formMode === "train") {
      // Different validation based on source tab
      if (sourceTab === "oneoff") {
        // For one-off, we just need the file
        isValid = isValid && !!formData.file;
      } else if (sourceTab === "annual") {
        // For annual, we might have additional requirements
        // This is where we can add annual-specific validation
        isValid = isValid && !!formData.file;
      }
    }

    return isValid;
  }, [formData, energyType, formMode, sourceTab]);

  return {
    formData,
    formKey,
    handleInputChange,
    handleClear,
    isFormValid: validateForm(),
    validateForm,
    setFormKey,
  };
}
