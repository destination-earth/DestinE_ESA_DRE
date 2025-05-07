import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import Card from "../ui/Card";
import SectionHeader from "../commonFormComponents/SectionHeader";
import FormActions from "../commonFormComponents/FormActions";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import PremiumSolarInputs from "./sourceSpecificFormComponents/PremiumSolarInputs";
import AssessmentInputsLayout from "./AssessmentInputsLayout";
// Corrected import paths assuming both basic and premium APIs are needed
import {
  SolarAssessmentApiResponse,
  BasicSolarAssessmentRequest,
  PremiumSolarAssessmentRequest,
  WindAssessmentApiResponse,
  PremiumWindAssessmentRequest,
  submitPremiumSolarAssessment,
  submitBasicSolarAssessment,
  submitPremiumWindAssessment,
} from "../../services/api/assessmentApi";
import { validateWindFiles } from "../../services/api/windAssessmentApi";
import {
  validateDate,
  validateEndDate,
  validateLatitudeFormat,
  validateLongitudeFormat,
  validateNumber,
  validateAzimuth,
  validateTilt,
  validateHubHeight,
} from "../../services/validation/validators";
import { ValidatedInputRef } from "../../services/validation/formValidation/ValidatedInput";
import useAssessmentFormValidation from "../../hooks/useAssessmentFormValidation";
import {
  SolarAssessmentPremium,
  WindAssessmentPremium,
} from "./text/AssessmentPreiumText";
import SuccessDialog from "../common/SuccessDialog"; // Import the shared SuccessDialog

// --- Interfaces ---
interface PremiumTabProps {
  energyType?: "solar" | "wind";
}

interface SolarFormData {
  location: string;
  startDate: string; endDate: string; latitude: string; longitude: string;
  tilt: string; azimuth: string; tracking: string; capacity: string;
}

interface WindFormData {
  location: string;
  startDate: string; endDate: string; latitude: string; longitude: string;
  height: string;
  hubHeight: string; powerCurveModel: string; powerCurveFile?: File | null;
}

// --- Component ---
const PremiumTab = ({ energyType = "solar" }: PremiumTabProps): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const effectiveEnergyType =
    energyType === "solar" || energyType === "wind" ? energyType : "solar";

  // --- State ---
  const [formData, setFormData] = useState<SolarFormData | WindFormData>(
    effectiveEnergyType === "solar"
      ? { location: "", startDate: "", endDate: "", latitude: "", longitude: "", tilt: "", azimuth: "", tracking: "0", capacity: "" }
      : { location: "", startDate: "", endDate: "", latitude: "", longitude: "", height: "", hubHeight: "40", powerCurveModel: "", powerCurveFile: null }
  );
  const [formKey, setFormKey] = useState(0);
  const [resetMap, setResetMap] = useState(false);
  const [formReset, setFormReset] = useState(false); // Prop for AssessmentInputsLayout
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false); // Dialog state
  
  // Wind validation state
  const [windValidationStatus, setWindValidationStatus] = useState<"idle" | "validating" | "success" | "error">("idle");
  const [windValidationMessage, setWindValidationMessage] = useState("");
  const [validatedPowerCurvePath, setValidatedPowerCurvePath] = useState<string | null>(null);
  const [guid, setGuid] = useState<string | null>(null);
  const [aux, setAux] = useState<string | null>(null);

  // --- Refs ---
  const inputRefs = useRef<Map<string, React.RefObject<ValidatedInputRef>>>(new Map());
  const getFieldRef = (fieldName: string): React.RefObject<ValidatedInputRef> => {
    if (!inputRefs.current.has(fieldName)) {
      inputRefs.current.set(fieldName, React.createRef<ValidatedInputRef>());
    }
    return inputRefs.current.get(fieldName)!;
  };

  // --- Validation Hook ---
  // The validation hook needs the correct data shape.
  // We pass the current formData, letting the hook internally decide which fields to validate based on energyType.
  const { isFormValid: isSolarFormValid, isOnlyGroup1Filled } =
    useAssessmentFormValidation(formData, effectiveEnergyType);

  // --- Form Actions ---
   const handleClear = () => {
     setFormData(
       effectiveEnergyType === "solar"
         ? { location: "", startDate: "", endDate: "", latitude: "", longitude: "", tilt: "", azimuth: "", tracking: "0", capacity: "" }
         : { location: "", startDate: "", endDate: "", latitude: "", longitude: "", height: "", hubHeight: "40", powerCurveModel: "", powerCurveFile: null }
     );
     inputRefs.current.forEach((ref) => {
       if (ref.current && ref.current.resetValidation) ref.current.resetValidation();
     });
     solarPremiumMutation.reset();
     solarBasicMutation.reset();
     windMutation.reset();
     
     // Reset wind validation state
     setWindValidationStatus("idle");
     setWindValidationMessage("");
     setValidatedPowerCurvePath(null);
     setGuid(null);
     setAux(null);
     
     setResetMap(true);
     setTimeout(() => setResetMap(false), 100);
     setFormReset(true); // Trigger form reset state for child components if needed
     setTimeout(() => setFormReset(false), 100);
     setFormKey((prevKey) => prevKey + 1); // Force re-render
   };

  // --- Mutations ---
  const handleMutationSuccess = () => {
    handleClear(); // Use the consistent clear function
    setIsSuccessDialogOpen(true); // Open dialog on success
  };

  const handleMutationError = (error: Error | AxiosError, context: string) => {
     console.error(`${context} assessment error:`, error);
     if (error instanceof AxiosError && error.response) {
       console.error("Error response data:", error.response.data);
       console.error("Error response status:", error.response.status);
     }
     // Add user-facing error notification here (e.g., toast)
  };

  // Define mutations with explicit types
  const solarPremiumMutation = useMutation<SolarAssessmentApiResponse, AxiosError, PremiumSolarAssessmentRequest>({
    mutationFn: submitPremiumSolarAssessment,
    onSuccess: handleMutationSuccess,
    onError: (err) => handleMutationError(err, "Premium Solar")
  });

  const solarBasicMutation = useMutation<SolarAssessmentApiResponse, AxiosError, BasicSolarAssessmentRequest>({
    mutationFn: submitBasicSolarAssessment,
    onSuccess: handleMutationSuccess,
    onError: (err) => handleMutationError(err, "Basic Solar")
  });

  // Combined wind mutation - handles basic/premium based on input structure within the submit function
  const windMutation = useMutation<WindAssessmentApiResponse, AxiosError, PremiumWindAssessmentRequest>({
      mutationFn: async (data) => {
           // Logic to differentiate and call the correct API endpoint
           // This depends heavily on how your backend and API functions are structured.
           // Example differentiation: Check for presence of premium-only fields.
           if ('powerCurveFile' in data || (data as PremiumWindAssessmentRequest).curve_model) {
               // Assume premium if powerCurveFile or a non-default powerCurveModel exists
               return submitPremiumWindAssessment(data as PremiumWindAssessmentRequest);
           } else {
               // Handle cases where premium fields are missing or if only basic fields are provided
               console.warn("Premium wind fields missing, check logic or data.");
               // For now, let's throw an error if premium is expected but data is insufficient
               // Or, if this component *only* submits premium, this 'else' might be unnecessary
               throw new Error("Insufficient data for Premium Wind Assessment.");
           }
      },
      onSuccess: handleMutationSuccess,
      onError: (err) => handleMutationError(err, "Wind")
  });


  const isLoading = solarPremiumMutation.isPending || solarBasicMutation.isPending || windMutation.isPending;
  const error = solarPremiumMutation.error || solarBasicMutation.error || windMutation.error; // Aggregate errors

  // --- Input/File Handlers ---
  const handleInputChange = (field: string) => (value: string) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handlePowerCurveFileUpload = (file: File | null) => {
    setFormData((prev) => ({ ...(prev as WindFormData), powerCurveFile: file }));
    // Reset validation state when a new file is uploaded
    setWindValidationStatus("idle");
    setWindValidationMessage("");
    setValidatedPowerCurvePath(null);
    setGuid(null);
    setAux(null);
  };
  
  // --- Wind File Validation ---
  const handleValidateWindFiles = async () => {
    const windData = formData as WindFormData;
    
    // Check if power curve file is required and present
    if (windData.powerCurveModel === "upload_custom") {
      if (!windData.powerCurveFile) {
        setWindValidationMessage("Custom Power Curve file is required.");
        setWindValidationStatus("error");
        return { success: false };
      }
      
      try {
        setWindValidationStatus("validating");
        setWindValidationMessage("Validating power curve file...");
        
        // Call the validation API
        const validationResponse = await validateWindFiles(windData.powerCurveFile);
        
        // Handle validation response
        if (validationResponse.status === "success") {
          // Set validation status to success
          setWindValidationStatus("success");
          setWindValidationMessage("Power curve file validated successfully.");
          
          // Store validation data for submission
          setValidatedPowerCurvePath(validationResponse.file_path || null);
          setGuid(validationResponse.guid || null);
          setAux(validationResponse.aux || null);
          
          console.log("✅ Wind file validation successful:", {
            file_path: validationResponse.file_path,
            guid: validationResponse.guid,
            aux: validationResponse.aux
          });
          
          return { success: true };
        } else {
          // Set validation status to error
          setWindValidationStatus("error");
          setWindValidationMessage(validationResponse.message || "Validation failed.");
          console.error("❌ Wind file validation failed:", validationResponse.message);
          return { success: false };
        }
      } catch (error) {
        setWindValidationStatus("error");
        setWindValidationMessage("Error validating power curve file. Please try again.");
        console.error(" Error validating wind files:", error);
        return { success: false };
      }
    } else {
      // No validation needed for non-custom power curves
      setWindValidationStatus("success");
      setWindValidationMessage("");
      return { success: true };
    }
  };

  // --- Effects ---
  useEffect(() => {
    // Reset form and map when energy type changes
    handleClear();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveEnergyType]);

  useEffect(() => {
    // Reset specific file inputs if needed (e.g., power curve)
    const powerCurveFileInput = document.getElementById("power-curve-file") as HTMLInputElement;
    if (powerCurveFileInput) powerCurveFileInput.value = "";
  }, [effectiveEnergyType]);

  // --- Validation Logic ---
  const isWindFormValid = (): boolean => {
    const windData = formData as WindFormData;
    const basicFieldsValid =
      !!windData.startDate && !!windData.endDate && !!windData.latitude && !!windData.longitude &&
      validateDate(windData.startDate, effectiveEnergyType) &&
      validateEndDate(windData.startDate, windData.endDate, effectiveEnergyType) &&
      validateLatitudeFormat(windData.latitude) &&
      validateLongitudeFormat(windData.longitude);

    if (!basicFieldsValid) return false;

    const onlyGroup1 = isOnlyGroup1Filled();

    if (onlyGroup1) {
        // Basic wind is valid if basic fields are okay (assuming no other specific basic fields)
        return true;
    } else {
         // Premium wind validation
         const premiumFieldsValid = !!windData.hubHeight && validateHubHeight(windData.hubHeight) && !!windData.powerCurveModel;
         if (!premiumFieldsValid) return false;

         // If custom curve selected, file is required and must be validated
         if (windData.powerCurveModel === "upload_custom") {
           // Require both the file and successful validation
           return !!windData.powerCurveFile && windValidationStatus === "success";
         }
         // Otherwise, selecting any other model is sufficient for premium
         return true;
    }
  };

  const isFormValid = (): boolean => {
    if (effectiveEnergyType === "solar") {
      return isSolarFormValid(); // Uses the validation hook result
    } else {
      return isWindFormValid(); // Uses custom wind validation logic
    }
  };

  // --- Submission Handler ---
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!isFormValid()) {
        console.error("Form is invalid.");
        // Add user feedback (e.g., highlight invalid fields or show toast)
        return;
    }

    const onlyGroup1 = isOnlyGroup1Filled();

      if (effectiveEnergyType === "solar") {
        const solarData = formData as SolarFormData;
        const solarRequestBase: BasicSolarAssessmentRequest = {
          location: solarData.location,
          startDate: solarData.startDate, endDate: solarData.endDate,
          latitude: parseFloat(solarData.latitude), longitude: parseFloat(solarData.longitude),
        };

        if (onlyGroup1) {
          console.log("Submitting Basic Solar Request:", solarRequestBase);
          solarBasicMutation.mutate(solarRequestBase);
        } else {
          const premiumSolarRequest: PremiumSolarAssessmentRequest = {
            location: solarData.location,
            startDate: solarData.startDate, endDate: solarData.endDate,
            latitude: parseFloat(solarData.latitude), longitude: parseFloat(solarData.longitude),
            tilt: parseFloat(solarData.tilt), azimuth: parseFloat(solarData.azimuth),
            tracking: parseFloat(solarData.tracking), capacity: parseFloat(solarData.capacity),
          };
          console.log("Submitting Premium Solar Request:", premiumSolarRequest);
          solarPremiumMutation.mutate(premiumSolarRequest);
        }
      } else { // Wind
        const windData = formData as WindFormData;
        const onlyGroup1 = isOnlyGroup1Filled(); // Check if only basic fields are filled

        if (onlyGroup1) {
          console.error("Basic wind submission attempted from PremiumTab. This should not happen.");
          // Display error to user
        } else {
          // For custom power curve, validate the file first
          if (windData.powerCurveModel === "upload_custom") {
            // Check if validation is needed
            if (windValidationStatus !== "success") {
              try {
                console.log("Validating power curve file before submission...");
                const validationResult = await handleValidateWindFiles();
                
                // Check the validation result
                if (!validationResult.success) {
                  console.error("Wind file validation failed. Please fix the issues and try again.");
                  return;
                }
                
                // Force a re-render to update the form validity
                setFormData({...formData});
              } catch (error) {
                console.error("Error during wind file validation:", error);
                return;
              }
            } else {
              console.log("Power curve file already validated, proceeding with submission...");
            }
          }
          
          // Construct premium wind request
          const parsedLatitude = parseFloat(windData.latitude ?? '');
          const parsedLongitude = parseFloat(windData.longitude ?? '');
          const parsedHeight = parseFloat(windData.height ?? '');
          const parsedHubHeight = parseFloat(windData.hubHeight ?? '');

          const premiumWindRequest: PremiumWindAssessmentRequest = {
            location: windData.location,
            startDate: windData.startDate, 
            endDate: windData.endDate,
            latitude: isNaN(parsedLatitude) ? 0 : parsedLatitude,
            longitude: isNaN(parsedLongitude) ? 0 : parsedLongitude,
            height: isNaN(parsedHeight) ? 0 : parsedHeight, // Default to 0 if NaN
            hub_height: isNaN(parsedHubHeight) ? 0 : parsedHubHeight, // Default to 0 if NaN
            curve_model: windData.powerCurveModel,
            powerCurveFile: windData.powerCurveFile as File | undefined, // Pass file or undefined
            // Include validation data
            file_path: validatedPowerCurvePath || undefined,
            guid: guid || undefined,
            aux: aux || undefined
          };
          
          console.log("Submitting Premium Wind Request:", premiumWindRequest);
          windMutation.mutate(premiumWindRequest);
        }
      }
  };

  // --- Other Handlers ---
   const handleDownloadTemplate = () => {
      const templateUrl = "https://hyrefapp.dev.desp.space/templates/assessment/wind/power_curve.csv";
      const link = document.createElement("a");
      link.href = templateUrl;
      link.setAttribute("download", "wind_premium_template.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card>
        <SectionHeader
           title={
               effectiveEnergyType === "solar"
                 ? t("assessment.premium.solar.title", "Retrieve Monthly Mean Solar Radiation & Energy Output Data")
                 : t("assessment.premium.wind.title", "Wind Speed and Energy Resource Assessment")
           }
          description={effectiveEnergyType === "solar" ? <SolarAssessmentPremium /> : <WindAssessmentPremium />}
        />
      </Card>

      {/* Form */}
       <form onSubmit={handleSubmit}>
          {/* Inputs Layout - includes basic fields + map + wind premium fields */}
          <Card>
            <AssessmentInputsLayout
              formType="premium"
              energyType={effectiveEnergyType}
              formData={formData}
              formKey={formKey}
              resetMap={resetMap}
              handleInputChange={(field: string) => (value: string) => {
                handleInputChange(field as keyof typeof formData)(value);
              }}
              validateDate={validateDate}
              validateEndDate={validateEndDate}
              validateRequired={(value) => !!value} // Basic required validation
              validateLatitudeFormat={validateLatitudeFormat}
              validateLongitudeFormat={validateLongitudeFormat}
              getFieldRef={getFieldRef}
              // Premium specific props
              validateHubHeight={validateHubHeight}
              validateTilt={validateTilt} // Only relevant for solar, but passed
              validateAzimuth={validateAzimuth} // Only relevant for solar
              validateNumber={validateNumber} // General number validation
              handlePowerCurveChange={(value: string) => handleInputChange("powerCurveModel")(value)}
              handlePowerCurveFileUpload={handlePowerCurveFileUpload}
              handleDownloadTemplate={handleDownloadTemplate}
              formReset={formReset}
              powerCurveFile={(formData as WindFormData).powerCurveFile}
              // Pass validation props
              windValidationStatus={windValidationStatus}
              windValidationMessage={windValidationMessage}
              onValidateWindFiles={handleValidateWindFiles}
            />
          </Card>

           {/* Solar Premium Inputs - Conditionally rendered */}
           {effectiveEnergyType === "solar" && (
              <Card className="mt-6">
                 <PremiumSolarInputs
                   tilt={(formData as SolarFormData).tilt}
                   azimuth={(formData as SolarFormData).azimuth}
                   tracking={(formData as SolarFormData).tracking}
                   capacity={(formData as SolarFormData).capacity}
                   onTiltChange={handleInputChange("tilt")}
                   onAzimuthChange={handleInputChange("azimuth")}
                   onTrackingChange={handleInputChange("tracking")}
                   onCapacityChange={handleInputChange("capacity")}
                   numberValidation={validateNumber}
                   azimuthValidation={validateAzimuth}
                   tiltValidation={validateTilt}
                   tiltRef={getFieldRef("tilt")}
                   azimuthRef={getFieldRef("azimuth")}
                   capacityRef={getFieldRef("capacity")}
                 />
              </Card>
           )}

           {/* Loading/Error Feedback */}
           {isLoading && (
             <div className="my-4 rounded bg-blue-50 p-3 text-blue-700">
               {t("assessment.common.loading", "Processing your request...")}
             </div>
           )}
           {error && (
              <div className="my-4 rounded bg-red-50 p-3 text-red-700">
                {t("assessment.common.error.submission", "Error submitting assessment")}: {error.message}
             </div>
           )}

           {/* Validation Message for Custom Power Curve */}
           {effectiveEnergyType === "wind" && 
            (formData as WindFormData).powerCurveModel === "upload_custom" && 
            (formData as WindFormData).powerCurveFile && 
            windValidationStatus !== "success" && (
              <div className="my-4 rounded bg-yellow-50 p-3 text-yellow-700">
                {windValidationStatus === "validating" 
                  ? t("assessment.wind.validating", "Validating power curve file...")
                  : t("assessment.wind.validation_required", "Please validate your power curve file before submitting.")}
              </div>
           )}
           
           {/* Form Actions */}
           <div className="mt-6">
             <FormActions
               onClear={handleClear} // Use the unified clear function
               onSubmit={handleSubmit}
               isSubmitDisabled={!isFormValid() || isLoading}
               // Use a generic submit text or specific based on premium/basic logic if needed
               submitButtonText={t("assessment.common.submit", "SUBMIT")}
               clearButtonText={t("assessment.common.clear", "CLEAR")}
             />
           </div>

          {/* Success Dialog */}
          <SuccessDialog
            isOpen={isSuccessDialogOpen}
            onClose={() => setIsSuccessDialogOpen(false)}
            onNavigate={() => {
              setIsSuccessDialogOpen(false);
              navigate({ to: '/archive' }); // Navigate to archive page
            }}
            title={t("assessment.common.successDialog.title", "Submission Successful")}
            message={t("assessment.common.successDialog.message", "Your assessment request has been submitted. You will be notified upon completion, and the results will be available in the Archive section.")}
          />
       </form>
      {/* Inline results display removed */}
    </div>
  );
};

export default PremiumTab;
