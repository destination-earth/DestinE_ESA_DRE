// useAssessmentForm.ts
// A custom hook for managing assessment form state and submission

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  SolarAssessmentApiResponse,
  WindAssessmentApiResponse,
  BasicSolarAssessmentRequest,
  PremiumSolarAssessmentRequest,
  BasicWindAssessmentRequest,
  PremiumWindAssessmentRequest
} from "../services/api/assessmentApi"; // Use centralized types
import { formatToISO } from "../utils/TimeUtils";
import { ValidatedInputRef } from "../services/validation/formValidation/ValidatedInput";
import useAssessmentFormValidation from "./useAssessmentFormValidation";
import { FormData as ValidationFormData } from "../services/validation/formValidation/AssessmentFormValidation"; // Import validation FormData
import {
  useBasicSolarAssessmentMutation,
  useBasicWindAssessmentMutation,
  usePremiumSolarAssessmentMutation,
  usePremiumWindAssessmentMutation,
  useWindBasicQuery
} from "./query/useAssessmentQueries";
import React from "react";

// Define local types for the form state (using strings for inputs)
interface BaseFormState {
  location: string;
  startDate: string;
  endDate: string;
  latitude: string;
  longitude: string;
}

interface SolarFormState extends BaseFormState {
  // Basic + Premium Solar fields
  tilt: string;
  azimuth: string;
  tracking: string; // Assuming '0', '1', '2' etc. as string input
  capacity: string;
}

interface WindFormState extends BaseFormState {
  // Basic + Premium Wind fields
  height: string; // Basic
  hubHeight: string; // Premium
  powerCurveModel: string; // Premium
  powerCurveFile: File | null; // Premium
}

type AssessmentFormState = SolarFormState | WindFormState;

interface UseAssessmentFormOptions {
  isPremium?: boolean;
}

/**
 * Custom hook for managing assessment form state and submission. 
 * Handles form data (strings), validation, and prepares API requests (numbers/Files).
 * @returns Form state and handlers
 */
export function useAssessmentForm(
  energyType: "solar" | "wind",
  options: UseAssessmentFormOptions = {}
) {
  const { isPremium = false } = options;
  
  // Ensure energy type is valid
  const effectiveEnergyType = 
    energyType === "solar" || energyType === "wind" ? energyType : "solar";
  
  // Initialize form data based on energy type
  const [formData, setFormData] = useState<AssessmentFormState>(
    effectiveEnergyType === "solar"
      ? { // Initialize SolarFormState
          location: "",
          startDate: "",
          endDate: "",
          latitude: "",
          longitude: "",
          tilt: "",
          azimuth: "",
          tracking: "0",
          capacity: "",
        } as SolarFormState
      : { // Initialize WindFormState
          location: "",
          startDate: "",
          endDate: "",
          latitude: "",
          longitude: "",
          height: "10",
          hubHeight: "40",
          powerCurveModel: "",
          powerCurveFile: null,
        } as WindFormState
  );
  
  // State for tracking results
  const [showResults, setShowResults] = useState(false);
  
  // Ref to track previous energy type for change detection
  const prevEnergyTypeRef = useRef(energyType);
  
  // Create refs for all validated inputs to reset their validation state
  const inputRefs = useRef<Map<string, React.RefObject<ValidatedInputRef>>>(
    new Map()
  );
  
  // Get validation functions
  const { isFormValid, isOnlyGroup1Filled } = useAssessmentFormValidation(
    formData as ValidationFormData, // Pass form state to validation hook
    effectiveEnergyType
  );
  
  // Initialize API mutations
  const basicSolarMutation = useBasicSolarAssessmentMutation();
  const premiumSolarMutation = usePremiumSolarAssessmentMutation();
  const basicWindMutation = useBasicWindAssessmentMutation();
  const premiumWindMutation = usePremiumWindAssessmentMutation();
  
  // For wind, also use the wind basic query if needed
  const [enableWindBasicQuery, setEnableWindBasicQuery] = useState(false);
  const windBasicQuery = useWindBasicQuery(
    formData.startDate,
    formData.endDate,
    parseFloat(formData.latitude || "0"), // Use parseFloat for query params
    parseFloat(formData.longitude || "0"),
    // Conditionally access height only if it's WindFormState
    parseFloat(effectiveEnergyType === 'wind' ? (formData as WindFormState).height || "10" : "10"),
    enableWindBasicQuery && effectiveEnergyType === "wind" && !isPremium
  );
  
  // Helper function to get or create a ref for a specific field
  const getFieldRef = (
    fieldName: string
  ): React.RefObject<ValidatedInputRef> => {
    if (!inputRefs.current.has(fieldName)) {
      inputRefs.current.set(fieldName, React.createRef<ValidatedInputRef>());
    }
    return inputRefs.current.get(fieldName)!;
  };
  
  // Handle form clear - using useCallback to avoid dependency issues in useEffect
  const handleClear = useCallback(() => {
    // Reset form data
    setFormData(
      effectiveEnergyType === "solar"
        ? { // Reset SolarFormState
            location: "",
            startDate: "",
            endDate: "",
            latitude: "",
            longitude: "",
            tilt: "",
            azimuth: "",
            tracking: "0",
            capacity: "",
          } as SolarFormState
        : { // Reset WindFormState
            location: "",
            startDate: "",
            endDate: "",
            latitude: "",
            longitude: "",
            height: "10",
            hubHeight: "40",
            powerCurveModel: "",
            powerCurveFile: null,
          } as WindFormState
    );
    
    // Reset validation state for all inputs
    inputRefs.current.forEach((ref) => {
      if (ref.current) {
        ref.current.resetValidation();
      }
    });
    
    // Reset mutations and queries
    basicSolarMutation.reset();
    premiumSolarMutation.reset();
    basicWindMutation.reset();
    premiumWindMutation.reset();
    setEnableWindBasicQuery(false);
    
    // Clear any previous results
    setShowResults(false);
  }, [
    effectiveEnergyType, 
    basicSolarMutation, 
    premiumSolarMutation, 
    basicWindMutation, 
    premiumWindMutation
  ]);
  
  // Reset form when energy type changes
  useEffect(() => {
    // Skip on first render, only clear when energy type actually changes
    if (prevEnergyTypeRef.current !== energyType) {
      handleClear();
    }
    
    // Update the ref with current energy type for next comparison
    prevEnergyTypeRef.current = energyType;
  }, [energyType, handleClear]);
  
  // Determine if any operation is loading
  const isLoading =
    basicSolarMutation.isPending ||
    premiumSolarMutation.isPending ||
    basicWindMutation.isPending ||
    premiumWindMutation.isPending ||
    windBasicQuery.isLoading;
  
  // Get error from the appropriate source
  const error = (() => {
    if (effectiveEnergyType === "solar") {
      return isPremium 
        ? premiumSolarMutation.error 
        : basicSolarMutation.error;
    } else {
      return isPremium
        ? premiumWindMutation.error
        : (windBasicQuery.error || basicWindMutation.error);
    }
  })();
  
  // Get data from the appropriate source
  const data = (() => {
    if (effectiveEnergyType === "solar") {
      return isPremium 
        ? premiumSolarMutation.data 
        : basicSolarMutation.data;
    } else {
      return isPremium
        ? premiumWindMutation.data
        : windBasicQuery.data || basicWindMutation.data;
    }
  })();
  
  // Helper functions to check response types
  const isSolarResponse = (
    response: unknown
  ): response is SolarAssessmentApiResponse => {
    if (!response) return false;
    const solarResponse = response as Partial<SolarAssessmentApiResponse>;
    
    // Check for solar-specific properties
    return !!(
      (Array.isArray(solarResponse.ghi) || 
       (solarResponse.data && Array.isArray(solarResponse.data.ghi)))
    );
  };

  const isWindResponse = (
    response: unknown
  ): response is WindAssessmentApiResponse => {
    if (!response) return false;
    const windResponse = response as Partial<WindAssessmentApiResponse>;
    
    // Check for wind-specific properties
    return !!(
      Array.isArray(windResponse.windSpeed) ||
      Array.isArray(windResponse.count_wind_speed) ||
      (windResponse.data && 
        (Array.isArray(windResponse.data.windSpeed) ||
         Array.isArray(windResponse.data.count_wind_speed)))
    );
  };
  
  // Effect to set showResults to true when data is available
  useEffect(() => {
    if (data) {
      // Check if the response is in the expected format with status property
      if (typeof data === 'object' && 'status' in data && data.status === "success") {
        setShowResults(true);
      }
      // Check if the response is a direct data object
      else if (
        typeof data === "object" &&
        ((effectiveEnergyType === "solar" && isSolarResponse(data)) ||
          (effectiveEnergyType === "wind" && isWindResponse(data)))
      ) {
        setShowResults(true);
      }
    }
  }, [data, effectiveEnergyType]);
  
  // Input change handler
  const handleInputChange = (field: string) => (value: string) => {
    // Reset mutations when form inputs change to prevent auto-submission
    if (data) {
      if (effectiveEnergyType === "solar") {
        isPremium ? premiumSolarMutation.reset() : basicSolarMutation.reset();
      } else {
        isPremium ? premiumWindMutation.reset() : basicWindMutation.reset();
        setEnableWindBasicQuery(false);
      }
      setShowResults(false);
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    // Reset showResults when submitting a new request
    setShowResults(false);
    
    if (isFormValid()) {
      // Determine if we should use basic or premium API
      const onlyGroup1 = isPremium ? isOnlyGroup1Filled() : true;
      
      if (effectiveEnergyType === "solar") {
        // Create request object for solar
        if (onlyGroup1 || !isPremium) {
          // Basic solar assessment
          const basicSolarRequest: BasicSolarAssessmentRequest = {
            startDate: formatToISO(formData.startDate) || "",
            endDate: formatToISO(formData.endDate) || "",
            location: formData.location, // Added location
            // Convert string state to number for API
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
          };
          console.log("Submitting Basic Solar Request:", basicSolarRequest);
          basicSolarMutation.mutate(basicSolarRequest);
        } else {
          // Premium solar assessment
          // Use type assertion as we are in the 'solar' block
          const solarFormData = formData as SolarFormState;
          const premiumSolarRequest: PremiumSolarAssessmentRequest = {
            startDate: formatToISO(solarFormData.startDate) || "",
            endDate: formatToISO(solarFormData.endDate) || "",
            location: formData.location, // Added location
            // Access solar-specific fields via solarFormData
            latitude: parseFloat(solarFormData.latitude),
            longitude: parseFloat(solarFormData.longitude),
            tilt: parseFloat(solarFormData.tilt),
            azimuth: parseFloat(solarFormData.azimuth),
            tracking: parseInt(solarFormData.tracking, 10), // Assuming tracking is integer index
            capacity: parseFloat(solarFormData.capacity),
          };
          console.log("Submitting Premium Solar Request:", premiumSolarRequest);
          premiumSolarMutation.mutate(premiumSolarRequest);
        }
      } else {
        // Wind Assessment
        if (!isPremium) {
          const basicWindRequest: BasicWindAssessmentRequest = {
            startDate: formatToISO(formData.startDate) || "",
            endDate: formatToISO(formData.endDate) || "",
            location: formData.location, // Added location
            // Convert string state to number for API
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            // Assert type to access wind-specific 'height'
            height: parseFloat((formData as WindFormState).height),
          };
          console.log("Submitting Basic Wind Request:", basicWindRequest);
          // Optionally trigger basic wind query here if needed
          // setEnableWindBasicQuery(true);
          basicWindMutation.mutate(basicWindRequest);
        } else {
          // Use type assertion as we are in the 'wind' block
          const windFormData = formData as WindFormState;
          // Assume formData includes powerCurveFile from input
          const premiumWindRequest: PremiumWindAssessmentRequest = {
            startDate: formatToISO(windFormData.startDate) || "",
            endDate: formatToISO(windFormData.endDate) || "",
            location: formData.location, // Added location
            // Access wind-specific fields via windFormData
            latitude: parseFloat(windFormData.latitude),
            longitude: parseFloat(windFormData.longitude),
            // Basic height is also part of premium
            height: parseFloat(windFormData.height),
            hub_height: parseFloat(windFormData.hubHeight),
            curve_model: windFormData.powerCurveModel,
            powerCurveFile: windFormData.powerCurveFile, // Pass the file object
          };
          console.log("Submitting Premium Wind Request:", premiumWindRequest);
          premiumWindMutation.mutate(premiumWindRequest);
        }
      }
    }
  };
  
  return {
    formData,
    setFormData,
    handleInputChange,
    handleSubmit,
    handleClear,
    getFieldRef,
    isLoading,
    error,
    data,
    showResults,
    isFormValid,
    isOnlyGroup1Filled,
    effectiveEnergyType
  };
}

export default useAssessmentForm;
