import React, { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@mui/material";
import { useTranslation } from "react-i18next";
import ValidatedInput, {
  ValidatedInputRef,
} from "../../services/validation/formValidation/ValidatedInput";
import FormActions from "../commonFormComponents/FormActions";
import HubHeightInput from "../commonFormComponents/HubHeightInput";
import FloatingLabelSelect from "../commonFormComponents/FloatingLabelSelect";
import FloatingLabelInput from "../commonFormComponents/FloatingLabelInput";
import {
  validateLatitudeFormat,
  validateLongitudeFormat,
  validateElevation,
  validatePositiveNumber,
  validateHubHeight,
} from "../../services/validation/validators";
import MapSelector from "../mapSelectorComponent/MapSelector";
import SolarTemplateUpload from "../fileHandling/solarTemplateUpload";
import WindTemplateUpload from "../fileHandling/WindTemplateUpload";
import CoordinateInputs from "../commonFormComponents/CoordinateInputs";
import { TemplateType } from "../../utils/templateUtils";
import {
  useForecastTemplateMutation,
  ForecastTemplateMutationParams,
} from "../../hooks/useForecastQueries";
import {
  useValidateSolarFileMutation,
  useValidateWindFilesMutation,
} from "../../hooks/useForecastQueries";
import { SolarValidationResponse } from "../../services/api/solarForecastApi";
import {
  ValidateWindFilesParams,
  FileValidationResult,
} from "../../types/forecastValidationTypes";
import { WindTrainDataTemplateDescription, PowerCurveDescription } from "../forecast/text/ForecastOneoffText";
import axios from "axios";

interface TrainForecastFormProps {
  energyType: "solar" | "wind";
  formData: {
    latitude: string;
    longitude: string;
    elevation: string;
    hubHeight?: string;
    powerCurveModel?: string;
    capacity?: string;
    file?: File | null;
  };
  onInputChange: (field: string) => (value: string | File | null) => void;
  planType: "oneoff" | "annual";
  onClear: () => void;
  onSubmit: () => void;
  sourceTab?: "oneoff" | "annual";
  formMode: "train" | "standard";
  isFormValid?: boolean;
}

const TrainForecastForm: React.FC<TrainForecastFormProps> = ({
  energyType,
  formData,
  onInputChange,
  onClear,
  onSubmit,
  sourceTab = "oneoff",
  formMode,
  planType,
  isFormValid,
}) => {
  const { t } = useTranslation();
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [isFileValidated, setIsFileValidated] = useState(false);
  const [validationErrorMsg, setValidationErrorMsg] = useState<string | null>(
    null,
  );
  const [validatedFilename, setValidatedFilename] = useState<string | null>(
    null,
  );
  const [solarGuid, setSolarGuid] = useState<string | null>(null);
  const [solarAux, setSolarAux] = useState<string | null>(null);
  const [powerCurveFile, setPowerCurveFile] = useState<File | null>(null);
  const [formKey, setFormKey] = useState(1); // Key for resetting file inputs
  const latitudeRef = useRef<ValidatedInputRef>(null);
  const longitudeRef = useRef<ValidatedInputRef>(null);
  const elevationRef = useRef<ValidatedInputRef>(null);
  const hubHeightRef = useRef<ValidatedInputRef>(null);
  const powerCurveModelRef = useRef<ValidatedInputRef>(null);
  const capacityRef = useRef<ValidatedInputRef>(null);
  const [isWindFileValidated, setIsWindFileValidated] = useState<boolean>(false);
  const [windValidationMessage, setWindValidationMessage] = useState<
    string | null
  >(null);
  const [validatedWindTemplatePath, setValidatedWindTemplatePath] = useState<
    string | null
  >(null);
  const [validatedWindPowerCurvePath, setValidatedWindPowerCurvePath] = useState<
    string | null
  >(null);
  const [validatedCombinedWindPath, setValidatedCombinedWindPath] = useState<
    string | null
  >(null);
  const [windGuid, setWindGuid] = useState<string | null>(null);
  const [windAux, setWindAux] = useState<string | null>(null);
  const {
    validateWindFiles,
    isWindValidationLoading, // Destructure loading state
    resetWindValidation, // Destructure reset function
  } = useValidateWindFilesMutation(); // Call the hook

  // Reference to track if a submission is in progress
  const isSubmittingRef = useRef(false);

  // Conditional check for solar
  const isSolar = energyType === "solar";

  // Use the forecast template mutation hook (for submission)
  const { uploadTemplate, isUploading } = useForecastTemplateMutation();

  // Define the onSuccess logic separately to pass to the mutation call
  const handleMutationSuccess = useCallback(() => {
    console.log("Form submitted successfully!");
    // Reset form after successful submission
    onSubmit(); // Call parent's onSubmit
    onClear(); // Call parent's onClear to reset form data
    setTemplateFile(null);
    setPowerCurveFile(null);
    setIsFileValidated(false); // Reset validation on successful submit
    setValidationErrorMsg(null);
    setValidatedFilename(null);
    setSolarGuid(null);
    setSolarAux(null);
    setIsWindFileValidated(false);
    setWindValidationMessage(null);
    setValidatedWindTemplatePath(null);
    setValidatedWindPowerCurvePath(null);
    setValidatedCombinedWindPath(null);
    setWindGuid(null);
    setWindAux(null);
    setFormKey((prev) => prev + 1); // Force re-render to clear fields via key prop
    isSubmittingRef.current = false; // Reset submission state
  }, [onSubmit, onClear]);

  // Use the validation mutation hook conditionally for solar
  const { validateFile, isValidationLoading, resetSolarValidation } =
    useValidateSolarFileMutation<SolarValidationResponse>({
      onSuccess: (data) => {
        const filename = data?.file_path; // Use file_path from response
        // Log the complete validation response for debugging
        console.log("Solar validation response:", JSON.stringify(data, null, 2));
        
        // Correctly check valid flag AND filename presence
        if (data?.valid && filename) {
          setIsFileValidated(true);
          setValidatedFilename(filename); // Store filePath
          
          // Store the GUID and auxiliary information from the validation response
          // Make sure we're capturing the GUID correctly
          if (data.guid) {
            console.log("Found GUID in validation response:", data.guid);
            setSolarGuid(data.guid);
          } else {
            console.log("No GUID found in validation response");
            setSolarGuid(""); // Use empty string instead of null
          }
          
          setSolarAux(data.aux || "");
          console.log("Solar validation GUID (after setting):", data.guid);
          setValidationErrorMsg(null);
        } else {
          setIsFileValidated(false);
          setValidatedFilename(null);
          setSolarGuid(null);
          setSolarAux(null);
          const errorMsg = data?.message || t("validationErrorUnknown");
          setValidationErrorMsg(errorMsg);
          console.error("Validation failed by API or file_path missing:", data); // Updated log message
        }
      },
      onError: (error: Error) => {
        setIsFileValidated(false);
        setValidatedFilename(null); // Reset filename on error
        setSolarGuid(null);
        setSolarAux(null);
        let apiErrorMessage = t("validationError");
        if (axios.isAxiosError(error)) {
          apiErrorMessage =
            error.response?.data?.detail || error.message || apiErrorMessage;
        } else if (error instanceof Error) {
          apiErrorMessage = error.message || apiErrorMessage;
        }
        setValidationErrorMsg(apiErrorMessage);
        console.error("Validation failed:", error);
      },
    });

  // --- Wind File Validation Handler ---
  const handleValidateWindFiles = useCallback(() => {
    // Get files from state
    const mainTemplateFile = templateFile;
    const customPowerCurveFile = powerCurveFile;
    const powerCurveModel = formData.powerCurveModel;

    // Basic checks
    if (!mainTemplateFile) {
      setWindValidationMessage("Template file is required for validation.");
      setIsWindFileValidated(false);
      setValidatedWindTemplatePath(null); // Clear paths
      setValidatedWindPowerCurvePath(null);
      setValidatedCombinedWindPath(null);
      setWindGuid(null);
      setWindAux(null);
      return;
    }
    if (powerCurveModel === "upload_custom" && !customPowerCurveFile) {
      setWindValidationMessage(
        "Custom Power Curve file is required when 'Upload Custom' model is selected.",
      );
      setIsWindFileValidated(false);
      setValidatedWindTemplatePath(null); // Clear paths
      setValidatedWindPowerCurvePath(null);
      setValidatedCombinedWindPath(null);
      setWindGuid(null);
      setWindAux(null);
      return;
    }

    // Clear previous message and reset mutation state
    setWindValidationMessage(null); // Assumes state is string | null
    setIsWindFileValidated(false); // Reset status before call
    setValidatedWindTemplatePath(null); // Clear paths before call
    setValidatedWindPowerCurvePath(null);
    setValidatedCombinedWindPath(null);
    setWindGuid(null);
    setWindAux(null);
    if (resetWindValidation) {
      resetWindValidation();
    }

    // Prepare the PARAMETER OBJECT for the mutation using the imported type
    // Make sure ValidateWindFilesParams is imported from '../../types/forecastValidationTypes'
    const validationParams: ValidateWindFilesParams = {
      templateFile: mainTemplateFile,
      // Send null if not custom model or file is missing
      powerCurveFile:
        powerCurveModel === "upload_custom" ? customPowerCurveFile : null,
      plan: planType, // Make sure planType prop is passed to TrainForecastForm
      powerCurveModel: powerCurveModel ?? "", // Ensure it's always a string
      type: "train", // Hardcoded for this form type
    };

    console.log("Validating wind files with params:", validationParams);
    setIsWindFileValidated(false); // Reset validation status before API call

    // Call the mutation with the parameter object
    if (validateWindFiles) {
      // --- Add onSuccess and onError here ---
      validateWindFiles(validationParams, {
        onSuccess: (data: FileValidationResult) => {
          console.log("Wind Validation Success:", data);
          if (data.valid && data.file_path) {
            setIsWindFileValidated(true);
            setWindValidationMessage(data.message || "Files validated successfully."); // Show success message
            setValidatedCombinedWindPath(data.file_path); // Store combined path
            // Parse file_path (can be one or two paths separated by '|')
            const paths = data.file_path.split("|");
            setValidatedWindTemplatePath(paths[0] || null); // Store first path
            setValidatedWindPowerCurvePath(paths[1] || null); // Store second path if exists
            // Store the GUID and auxiliary information from the validation response
            setWindGuid(data.guid || null);
            setWindAux(data.aux || null);
            console.log("Wind validation GUID:", data.guid);
          } else {
            setIsWindFileValidated(false);
            setValidatedWindTemplatePath(null);
            setValidatedWindPowerCurvePath(null);
            setValidatedCombinedWindPath(null);
            setWindGuid(null);
            setWindAux(null);
            setWindValidationMessage(data.message || "Wind file validation failed. Please check the file(s).");
          }
        },
        onError: (error: Error) => {
          console.error("Wind validation API call failed:", error);
          setIsWindFileValidated(false);
          setValidatedWindTemplatePath(null);
          setValidatedWindPowerCurvePath(null);
          setValidatedCombinedWindPath(null);
          setWindGuid(null);
          setWindAux(null);
          setWindValidationMessage(`Validation request failed: ${error.message || "Unknown error"}`);
        },
      });
      // --- End of added handlers ---
    } else {
      console.error("validateWindFiles mutation function is not available.");
      setWindValidationMessage(
        "Validation setup error. Please try again later.",
      );
    }
  }, [
    templateFile, // State dependency
    powerCurveFile, // State dependency
    formData.powerCurveModel, // Form data dependency
    planType, // Prop dependency
    validateWindFiles, // Hook mutation function
    resetWindValidation, // Hook reset function
  ]);
  // --- End of Wind File Validation Handler ---

  // Wrapper function to call the mutation
  const handleValidateFile = useCallback(() => {
    if (templateFile) {
      // Clear previous validation status before starting
      setIsFileValidated(false);
      setValidationErrorMsg(null);
      validateFile(templateFile); // Call with file directly
    }
  }, [templateFile, validateFile]);

  // Handler for template file changes
  const handleTemplateFileChange = useCallback(
    (file: File | null) => {
      setTemplateFile(file);
      setIsFileValidated(false); // Reset validation status on new file
      setValidationErrorMsg(null); // Clear previous errors on new file
      setValidatedFilename(null);
      resetSolarValidation(); // Reset mutation state on new file
    },
    [resetSolarValidation],
  );

  // Initialize form validation state as false to disable the button until validation passes
  const [isFormValidState, setIsFormValid] = useState(false);

  const validateFormInternal = useCallback(() => {
    // Basic validations for both energy types
    const isLatitudeValid = validateLatitudeFormat(formData.latitude);
    const isLongitudeValid = validateLongitudeFormat(formData.longitude || "");
    const isTemplateFileValid = !!templateFile || !!formData.file;

    // Initialize isValid based on common validations
    let isValid = isLatitudeValid && isLongitudeValid && isTemplateFileValid;

    // Additional validations based on energy type
    if (energyType === "solar") {
      // Solar-specific validations
      const isElevationValid = validateElevation(formData.elevation);
      isValid = isValid && isElevationValid && isFileValidated;

      // Log validation state for debugging
      console.log("Solar validation state:", {
        isLatitudeValid,
        isLongitudeValid,
        isTemplateFileValid,
        isElevationValid,
        isValid,
      });
    } else if (energyType === "wind") {
      // Wind-specific validations
      const isCapacityValid = validatePositiveNumber(formData.capacity || "");
      const isHubHeightValid = validateHubHeight(formData.hubHeight || "");
      const isPowerCurveFileRequired =
        formData.powerCurveModel === "upload_custom";
      const isPowerCurveFileValid =
        !isPowerCurveFileRequired || !!powerCurveFile;

      console.log("--- Wind Validation Check ---");
      console.log("Capacity:", formData.capacity, "Valid:", isCapacityValid);
      console.log(
        "Hub Height:",
        formData.hubHeight,
        "Valid:",
        isHubHeightValid,
      );
      console.log(
        "Power Curve Model:",
        formData.powerCurveModel,
        "Selected:",
        !!formData.powerCurveModel && formData.powerCurveModel !== "",
      );
      console.log("Is Custom PC Required:", isPowerCurveFileRequired);
      console.log("Custom PC File State:", powerCurveFile);
      console.log("Is Custom PC File Valid:", isPowerCurveFileValid);

      // Require capacity, hub height, template file, and power curve file (if custom) for wind
      isValid =
        isValid &&
        isCapacityValid &&
        isHubHeightValid &&
        isPowerCurveFileValid &&
        isWindFileValidated;

      console.log("Final Wind isValid:", isValid);
    }

    // Update the form validity state
    setIsFormValid(isValid);
    return isValid;
  }, [
    formData.latitude,
    formData.longitude,
    formData.elevation,
    formData.capacity,
    formData.hubHeight,
    formData.powerCurveModel,
    templateFile,
    formData.file,
    powerCurveFile,
    energyType,
    isFileValidated,
    isWindFileValidated,
  ]);

  // Use the internal validation or the parent's validation based on what's available
  const effectiveIsFormValid =
    isFormValid !== undefined ? isFormValid : isFormValidState;

  // Validate form when formData changes
  useEffect(() => {
    validateFormInternal();
  }, [
    formData.latitude,
    formData.longitude,
    formData.elevation,
    formData.capacity,
    formData.hubHeight,
    formData.powerCurveModel,
    templateFile,
    formData.file,
    powerCurveFile,
    energyType,
    validateFormInternal,
  ]);

  // Handle map selection
  const handleMapSelect = useCallback(
    (lat: string, lng: string) => {
      onInputChange("latitude")(lat);
      onInputChange("longitude")(lng);
    },
    [onInputChange],
  );

  // Handler for internal state clear + parent clear (defined before handleSubmit)
  const handleClearInternal = useCallback(() => {
    // Reset internal state
    setTemplateFile(null);
    setIsFileValidated(false);
    setValidationErrorMsg(null);
    setValidatedFilename(null);
    setPowerCurveFile(null);
    setIsWindFileValidated(false);
    setWindValidationMessage(null);
    setValidatedWindTemplatePath(null);
    setValidatedWindPowerCurvePath(null);
    setValidatedCombinedWindPath(null);
    setWindGuid(null);
    setWindAux(null);
    latitudeRef.current?.resetValidation();
    longitudeRef.current?.resetValidation();
    elevationRef.current?.resetValidation();
    hubHeightRef.current?.resetValidation();
    powerCurveModelRef.current?.resetValidation();
    capacityRef.current?.resetValidation();

    // Increment form key to force re-render
    setFormKey((prev) => prev + 1);

    // Call the parent's onClear function
    onClear();
  }, [onClear]);

  // Reset validation state when energy type changes
  useEffect(() => {
    console.log(
      `Energy type changed to: ${energyType}. Resetting relevant validation states.`,
    );

    // Reset Solar Validation State
    setIsFileValidated(false); // Reset solar's backend validation flag
    setValidationErrorMsg(""); // Clear solar's validation message
    setValidatedFilename(null); // Clear solar's validated filename
    setSolarGuid(null);
    setSolarAux(null);
    if (resetSolarValidation) {
      // Use solar's reset function from its hook
      resetSolarValidation();
    }

    // Reset Wind Validation State
    setIsWindFileValidated(false); // Reset wind's backend validation flag
    setWindValidationMessage(null); // Clear wind's validation message
    setValidatedWindTemplatePath(null);
    setValidatedWindPowerCurvePath(null);
    setValidatedCombinedWindPath(null);
    setWindGuid(null);
    setWindAux(null);
    if (resetWindValidation) {
      // Use wind's reset function from its hook
      resetWindValidation();
    }

    // Optionally reset the template/power curve file states if needed,
    // though handleTemplateFileChange/handlePowerCurveFileChange might already do this.
    // setTemplateFile(null);
    // setPowerCurveFile(null);
  }, [energyType, resetSolarValidation, resetWindValidation]); // Dependencies: run when type or reset functions change

  // Handler for form submission
  const handleSubmit = useCallback(async () => {
    // Prevent multiple submissions
    if (isSubmittingRef.current) return;

    // Check if form is valid before proceeding
    if (!effectiveIsFormValid) {
      console.log("Form submission blocked: Form validation failed");
      return;
    }

    // Additional check for solar: ensure file is validated
    if (isSolar && !isFileValidated) {
      console.log("Solar file validation required before submission.");
      setValidationErrorMsg(
        "Please validate the template file before submitting.",
      ); // Show user message
      return;
    }

    // Set submission flag at the beginning
    isSubmittingRef.current = true;

    // Determine submission type ('basic' or 'premium')
    const submissionType = sourceTab === "annual" ? "premium" : "basic";

    // Parse coordinates and handle potential NaN values
    const latitude = parseFloat(formData.latitude);
    const longitude = parseFloat(formData.longitude);

    const finalLatitude = !isNaN(latitude) ? latitude : 0;
    const finalLongitude = !isNaN(longitude) ? longitude : 0;

    // Prepare parameters for the mutation
    let uploadParams: ForecastTemplateMutationParams;

    if (isSolar) {
      // Parse elevation specifically for solar
      const elevation = parseFloat(formData.elevation);
      const finalElevation = !isNaN(elevation) ? elevation : 0;

      // Solar requires validatedFilename
      if (!validatedFilename) {
        console.error(
          "Solar submission attempted without a validated filename.",
        );
        setValidationErrorMsg(t("validationErrorNotValidated"));
        isSubmittingRef.current = false;
        return; // Stop submission
      }
      // Log the GUID before creating params
      console.log("Solar GUID before submission:", solarGuid);
      
      uploadParams = {
        type: "solar",
        submissionType,
        latitude: finalLatitude,
        longitude: finalLongitude,
        elevation: finalElevation, // Pass elevation for solar
        validatedFilename: validatedFilename, // Pass the validated name
        guid: solarGuid || "", // Include the GUID from validation response (use empty string instead of undefined)
        aux: solarAux || "", // Include auxiliary information if available
      };
    } else {
      // Check if wind files have been validated
      if (!isWindFileValidated || !validatedWindTemplatePath) {
        console.error("Wind submission attempted without validated files.");
        setWindValidationMessage(t("validationErrorNotValidatedWind")); // Use a specific translation key
        isSubmittingRef.current = false;
        return; // Stop submission
      }

      // Parse capacity and hub height
      const capacity = parseFloat(formData.capacity || "0");
      const hubHeight = parseFloat(formData.hubHeight || "0");
      const finalCapacity = !isNaN(capacity) ? capacity : 0;
      const finalHubHeight = !isNaN(hubHeight) ? hubHeight : 0;

      // Log the GUID before creating params
      console.log("Wind GUID before submission:", windGuid);
      
      uploadParams = {
        type: "wind",
        submissionType,
        latitude: finalLatitude,
        longitude: finalLongitude,
        // Wind specific parameters
        capacity: finalCapacity,
        hubHeight: finalHubHeight,
        powerCurveModel: formData.powerCurveModel || "", // Ensure a string value
        validatedTemplateFilename: validatedWindTemplatePath, // Use validated path
        validatedPowerCurveFilename: validatedWindPowerCurvePath, // Use validated path (can be null)
        validatedCombinedPath: validatedCombinedWindPath, // Raw combined path
        guid: windGuid || "", // Include the GUID from validation response (use empty string instead of undefined)
        aux: windAux || "", // Include auxiliary information if available
      };
    }

    console.log("Submitting with params:", uploadParams);

    // Call the mutate function (uploadTemplate) with params and options
    uploadTemplate(uploadParams, {
      onSuccess: handleMutationSuccess, // Pass the success handler here
      onError: (error: Error) => {
        // <-- Type the error parameter
        console.error("Submission failed:", error);
        // TODO: Add user-facing error handling, e.g., set an error message state
        isSubmittingRef.current = false; // Reset submission state on error
      },
    });
  }, [
    effectiveIsFormValid,
    isFileValidated,
    isWindFileValidated,
    isSubmittingRef,
    sourceTab,
    isSolar,
    validatedFilename,
    validatedWindTemplatePath,
    validatedWindPowerCurvePath,
    validatedCombinedWindPath,
    formData.latitude,
    formData.longitude,
    formData.elevation,
    formData.capacity,
    formData.hubHeight,
    formData.powerCurveModel,
    t,
    uploadTemplate, // Use the correct mutate function name
    handleMutationSuccess,
    setValidationErrorMsg,
    setWindValidationMessage,
    solarGuid,
    solarAux,
    windGuid,
    windAux,
  ]);

  // Use formData.file if available, or fall back to internal templateFile state
  useEffect(() => {
    if (formData.file && !templateFile) {
      setTemplateFile(formData.file);
    }
  }, [formData.file, templateFile]);

  // Restored handlePowerCurveChange function
  const handlePowerCurveChange = useCallback(
    (value: string) => {
      // Update form data with the selected value (0, 1, or 2)
      onInputChange("powerCurveModel")(value);

      // If custom option is selected, prompt for file upload
      // if (value === "upload_custom") {
      //   document.getElementById("powerCurveFileInput")?.click();
      // }
    },
    [onInputChange],
  );

  // NEW: Handler for Power Curve file upload via inline component
  const handlePowerCurveFileUploadCallback = useCallback(
    (file: File | null) => {
      setPowerCurveFile(file);
      // Reset relevant validation if needed when file changes
      // TODO: Add logic here if power curve validation is implemented
    },
    [], // No dependencies needed yet
  );

  console.log(
    "TrainForecastForm render check: effectiveIsFormValid:",
    effectiveIsFormValid,
    "isSubmitting:",
    isSubmittingRef.current, // Log the current value of the ref
  );

  return (
    <div key={formKey} className="space-y-8">
      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className={`mb-6 ${sourceTab === "annual" ? "annual-form" : "oneoff-form"}`}
        >
          {/* Map and Form Container */}
          <div className="flex flex-col gap-6 pb-6 md:flex-row">
            {/* Map Selector Column */}
            <div className="w-full md:w-3/4">
              <div
                className="mb-4 h-[400px] md:h-[500px]"
                style={{ background: "transparent" }}
              >
                <MapSelector
                  latitude={formData.latitude ?? "0"}
                  longitude={formData.longitude ?? "0"}
                  onCoordinateChange={handleMapSelect}
                />
              </div>
              {/* NEW: Power Curve File Upload Section (below map for Wind Train) */}
              {energyType === "wind" &&
                formData.powerCurveModel === "upload_custom" && (
                  <div className="mt-4 rounded border border-gray-300 bg-gray-50 p-4">
                    <WindTemplateUpload
                      onFileUpload={handlePowerCurveFileUploadCallback}
                      shouldReset={formKey > 1}
                      title="Custom Wind Turbine Power Curve Upload"
                      description={<PowerCurveDescription />}
                      uploadPrompt="Drop your power curve CSV file here or click to browse"
                      templateType={TemplateType.POWER_CURVE}
                      // We might need specific validation/display logic here later
                      // Add a key if multiple instances cause issues: key="power-curve-uploader"
                    />
                    {/* Display selected power curve file name */}
                    {powerCurveFile && (
                      <div className="mt-2 text-xs text-gray-600">
                        <span className="font-medium">
                          Selected Power Curve:
                        </span>{" "}
                        {powerCurveFile.name}
                      </div>
                    )}
                  </div>
                )}
            </div>

            {/* Form Fields Column - Reduced to 1/4 width and stacked vertically */}
            <div className="mt-4 w-full space-y-16 md:w-1/4">
              {/* Coordinate Inputs */}
              <CoordinateInputs
                latitude={formData.latitude || ""}
                longitude={formData.longitude || ""}
                elevation={
                  energyType === "solar" ? formData.elevation || "" : undefined
                }
                onLatitudeChange={onInputChange("latitude")}
                onLongitudeChange={onInputChange("longitude")}
                onElevationChange={
                  energyType === "solar"
                    ? onInputChange("elevation")
                    : undefined
                }
                validateLatitude={validateLatitudeFormat}
                validateLongitude={validateLongitudeFormat}
                validateElevation={
                  energyType === "solar" ? validateElevation : undefined
                }
                containerClassName="space-y-18"
                latitudeRef={latitudeRef}
                longitudeRef={longitudeRef}
                elevationRef={energyType === "solar" ? elevationRef : undefined}
              />

              {/* Add extra spacing between longitude and wind inputs */}
              {energyType === "wind" && <div className=""></div>}

              {/* Hub Height Input for Wind */}
              {energyType === "wind" && (
                <div className="mb-24">
                  <HubHeightInput
                    value={formData.hubHeight || ""}
                    onChange={onInputChange("hubHeight")}
                    validate={validateHubHeight}
                    inputRef={hubHeightRef}
                  />
                </div>
              )}

              {/* Render the rest of the wind-specific inputs */}
              {energyType === "wind" && (
                <>
                  <div className="mb-24 w-full">
                    <FloatingLabelSelect
                      id="powerCurveModel"
                      label={t(
                        "forecast.oneoff.field.powerCurveModel",
                        "Power Curve Models",
                      )}
                      value={formData.powerCurveModel || ""}
                      onChange={(value: string) =>
                        handlePowerCurveChange(value)
                      }
                      options={[
                        {
                          value: "upload_custom",
                          label: "Custom Power Curve",
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
                      className="h-16"
                    />
                    {powerCurveFile &&
                      formData.powerCurveModel === "upload_custom" && (
                        <div className="mt-2 text-sm text-green-600">
                          <span className="font-medium">Selected file:</span>{" "}
                          {powerCurveFile.name}
                        </div>
                      )}
                  </div>

                  <div className="mb-24 w-full">
                    <FloatingLabelInput
                      id="capacity"
                      label={t("forecast.oneoff.field.capacity", "Capacity")}
                    >
                      <ValidatedInput
                        id="capacity"
                        type="text"
                        value={formData.capacity || ""}
                        onChange={onInputChange("capacity")}
                        validate={validatePositiveNumber}
                        errorMessage={t(
                          "forecast.oneoff.validation.capacity",
                          "Please enter a valid capacity value",
                        )}
                        placeholder={t(
                          "forecast.oneoff.placeholder.capacity",
                          "Enter capacity (kW)",
                        )}
                        className="h-16 w-full border-2 p-2 pt-4 text-gray-500 focus:outline-none focus:ring-0"
                        ref={capacityRef}
                      />
                    </FloatingLabelInput>
                  </div>
                </>
              )}
            </div>
          </div>
        </form>
      </Card>
      {/* Template Upload Card */}
      {energyType === "solar" ? (
        <Card className="mb-6 overflow-hidden">
          <SolarTemplateUpload
            onFileUpload={handleTemplateFileChange}
            shouldReset={formKey > 1}
            onValidate={handleValidateFile}
            isValidationLoading={isValidationLoading}
            validationErrorMsg={validationErrorMsg}
            isFileValidated={isFileValidated}
            templateType={TemplateType.TRAIN_DATA}
          />
        </Card>
      ) : (
        <Card className="mb-6 overflow-hidden">
          <WindTemplateUpload
            onFileUpload={setTemplateFile} // Handles setting templateFile state
            onValidate={handleValidateWindFiles} // **VALIDATION HANDLER**
            title="Upload your Wind Template File here"
            uploadPrompt="Click or drag file to this area to upload your wind data template"
            isValidationLoading={isWindValidationLoading}
            validationErrorMsg={windValidationMessage}
            isFileValidated={isWindFileValidated}
            shouldReset={formKey > 1}
            description={<WindTrainDataTemplateDescription />}
            templateType={TemplateType.TRAIN_DATA}
          />
        </Card>
      )}

      {/* Form Action Buttons */}
      <div className="mt-6 flex justify-end space-x-4">
        <FormActions
          onClear={handleClearInternal}
          onSubmit={handleSubmit}
          isSubmitDisabled={
            !effectiveIsFormValid || isUploading || isValidationLoading
          }
          submitButtonText={
            // Restore correct button text logic
            isUploading || isValidationLoading
              ? formMode === "train"
                ? t("forecast.common.button.uploading", "UPLOADING...")
                : t("forecast.common.button.sending", "SENDING...")
              : formMode === "train"
                ? t("forecast.common.button.order", "Order")
                : t("forecast.common.button.send", "SEND") // Or Submit Request? Check original text
          }
          clearButtonText={t("forecast.common.button.clear", "Clear")}
        />
      </div>

      {/* Hidden file input for power curve upload */}
      <input
        type="file"
        id="powerCurveFileInput"
        style={{ display: "none" }}
        accept=".csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setPowerCurveFile(file);
            console.log(`Selected power curve file: ${file.name}`);
          }
        }}
      />
    </div>
  );
};

export default TrainForecastForm;
