// AssessmentFormValidation.ts
// A service for validating assessment forms

// Import validation functions from existing validators
import { 
  validateDate, 
  validateLatitudeFormat, 
  validateLongitudeFormat, 
  validateNumber, 
  validateTilt, 
  validateAzimuth,
  validateEndDate
} from '../validators';

// Types for form data
export interface CommonFormFields {
  startDate: string;
  endDate: string;
  latitude: string;
  longitude: string;
}

export interface SolarFormData extends CommonFormFields {
  tilt: string;
  azimuth: string;
  tracking: string;
  capacity: string;
}

export interface WindFormData extends CommonFormFields {
  hubHeight: string;
  powerCurveModel: string;
  fileUploaded?: boolean; // Add fileUploaded property
}

export type FormData = SolarFormData | WindFormData;

// Main validation service
export const AssessmentFormValidation = {
  /**
   * Validates if Group 1 (common fields) is complete and valid
   */
  isGroup1Complete: (formData: FormData, energyType: "solar" | "wind"): boolean => {
    const commonFields = formData as CommonFormFields;
    return (
      !!commonFields.startDate &&
      !!commonFields.endDate &&
      !!commonFields.latitude &&
      !!commonFields.longitude &&
      validateDate(commonFields.startDate, energyType) &&
      validateEndDate(commonFields.startDate, commonFields.endDate, energyType) &&
      validateLatitudeFormat(commonFields.latitude) &&
      validateLongitudeFormat(commonFields.longitude)
    );
  },

  /**
   * Validates if Group 2 (specialized fields) is complete and valid
   */
  isGroup2Complete: (formData: FormData, energyType: "solar" | "wind"): boolean => {
    if (energyType === "solar") {
      const solarData = formData as SolarFormData;
      return (
        !!solarData.tilt &&
        !!solarData.azimuth &&
        !!solarData.tracking &&
        !!solarData.capacity &&
        validateTilt(solarData.tilt) &&
        validateAzimuth(solarData.azimuth) &&
        solarData.tracking !== "" &&
        validateNumber(solarData.capacity)
      );
    } else {
      const windData = formData as WindFormData;
      
      // Special handling for "upload_custom" option
      if (windData.powerCurveModel === "upload_custom") {
        // When "Upload Your Power Curve" is selected, we need to check if a file has been uploaded
        return (
          !!windData.hubHeight &&
          validateNumber(windData.hubHeight) &&
          windData.fileUploaded === true // File must be uploaded
        );
      }
      
      // For other power curve models, no file upload is required
      return (
        !!windData.hubHeight &&
        !!windData.powerCurveModel &&
        validateNumber(windData.hubHeight) &&
        windData.powerCurveModel !== ""
      );
    }
  },

  /**
   * Checks if Group 2 (specialized fields) is empty
   */
  isGroup2Empty: (formData: FormData, energyType: "solar" | "wind"): boolean => {
    if (energyType === "solar") {
      const solarData = formData as SolarFormData;
      return (
        !solarData.tilt &&
        !solarData.azimuth &&
        (!solarData.tracking || solarData.tracking === "0") &&
        !solarData.capacity
      );
    } else {
      const windData = formData as WindFormData;
      return (
        !windData.powerCurveModel
      );
    }
  },

  /**
   * Validates the entire form
   * Form is valid if:
   * 1. Group 1 is complete AND
   * 2. For solar: Either Group 2 is completely empty OR Group 2 is complete
   * 3. For wind: Group 2 must be complete (powerCurveModel is mandatory)
   */
  isFormValid: (formData: FormData, energyType: "solar" | "wind"): boolean => {
    // For wind energy type, always require Group 2 to be complete (powerCurveModel is mandatory)
    if (energyType === "wind") {
      return (
        AssessmentFormValidation.isGroup1Complete(formData, energyType) && 
        AssessmentFormValidation.isGroup2Complete(formData, energyType)
      );
    }
    
    // For solar energy type, allow Group 2 to be empty
    return (
      AssessmentFormValidation.isGroup1Complete(formData, energyType) && 
      (
        AssessmentFormValidation.isGroup2Empty(formData, energyType) || 
        AssessmentFormValidation.isGroup2Complete(formData, energyType)
      )
    );
  },

  /**
   * Checks if only Group 1 is filled (Group 2 is empty)
   * For wind energy type, this will always return false as powerCurveModel is mandatory
   */
  isOnlyGroup1Filled: (formData: FormData, energyType: "solar" | "wind"): boolean => {
    // For wind energy type, Group 1 can never be considered "only filled" since powerCurveModel is mandatory
    if (energyType === "wind") {
      return false;
    }
    
    // For solar energy type, check if Group 1 is complete and Group 2 is empty
    return (
      AssessmentFormValidation.isGroup1Complete(formData, energyType) && 
      AssessmentFormValidation.isGroup2Empty(formData, energyType)
    );
  }
};

export default AssessmentFormValidation;
