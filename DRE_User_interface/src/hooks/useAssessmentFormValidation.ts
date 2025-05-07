// useAssessmentFormValidation.ts
// A custom hook for assessment form validation

import { useMemo } from 'react';
import AssessmentFormValidation, { FormData } from '../services/validation/formValidation/AssessmentFormValidation';

/**
 * Custom hook that provides assessment form validation functions
 * @param formData The form data to validate
 * @param energyType The type of energy (solar or wind)
 * @returns Object containing validation functions
 */
export function useAssessmentFormValidation(
  formData: FormData,
  energyType: "solar" | "wind"
) {
  // Use useMemo to avoid unnecessary recalculations
  return useMemo(() => ({
    /**
     * Checks if the entire form is valid
     */
    isFormValid: () => AssessmentFormValidation.isFormValid(formData, energyType),
    
    /**
     * Checks if only Group 1 fields are filled (Group 2 is empty)
     */
    isOnlyGroup1Filled: () => AssessmentFormValidation.isOnlyGroup1Filled(formData, energyType),
    
    /**
     * Checks if Group 1 (common fields) is complete and valid
     */
    isGroup1Complete: () => AssessmentFormValidation.isGroup1Complete(formData, energyType),
    
    /**
     * Checks if Group 2 (specialized fields) is complete and valid
     */
    isGroup2Complete: () => AssessmentFormValidation.isGroup2Complete(formData, energyType),
    
    /**
     * Checks if Group 2 (specialized fields) is empty
     */
    isGroup2Empty: () => AssessmentFormValidation.isGroup2Empty(formData, energyType)
  }), [formData, energyType]);
}

export default useAssessmentFormValidation;
