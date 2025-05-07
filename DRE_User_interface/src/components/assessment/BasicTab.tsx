import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useNavigate } from "@tanstack/react-router"; // Correct import
import Card from "../ui/Card";
import FormActions from "../commonFormComponents/FormActions";
import SectionHeader from "../commonFormComponents/SectionHeader";
import {
  validateRequired,
  validateDate,
  validateEndDate,
  validateLatitudeFormat,
  validateLongitudeFormat,
} from "../../services/validation/validators";
import { ValidatedInputRef } from "../../services/validation/formValidation/ValidatedInput";
import AssessmentInputsLayout from "./AssessmentInputsLayout";
import {
  SolarAssessmentApiResponse,
  BasicSolarAssessmentRequest,
  WindAssessmentApiResponse,
  BasicWindAssessmentRequest,
  submitBasicSolarAssessment,
  submitBasicWindAssessment,
} from "../../services/api/assessmentApi"; // Import from unified API entry point
import {
  formatToISO,
} from "../../utils/TimeUtils";
import useAssessmentFormValidation from "../../hooks/useAssessmentFormValidation";
import { FormData as AssessmentFormData } from "../../services/validation/formValidation/AssessmentFormValidation";
import SuccessDialog from "../common/SuccessDialog"; // Import SuccessDialog
import {
  WindAssessmentBasic,
  SolarAssessmentBasic,
} from "./text/AssessmentBasicText";

interface BasicTabProps {
  energyType?: "solar" | "wind";
}

interface FormData {
  startDate: string;
  endDate: string;
  latitude: string;
  longitude: string;
  height?: string;
  location?: string; // Add location property
}

const BasicTab = ({ energyType = "solar" }: BasicTabProps): React.ReactNode => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const effectiveEnergyType =
    energyType === "solar" || energyType === "wind" ? energyType : "solar";

  const inputRefs = useRef<Map<string, React.RefObject<ValidatedInputRef>>>(
    new Map(),
  );

  const prevEnergyTypeRef = useRef(energyType);

  const getFieldRef = (
    fieldName: string,
  ): React.RefObject<ValidatedInputRef> => {
    if (!inputRefs.current.has(fieldName)) {
      inputRefs.current.set(fieldName, React.createRef<ValidatedInputRef>());
    }
    return inputRefs.current.get(fieldName)!;
  };

  const [formData, setFormData] = useState<FormData>({
    startDate: "",
    endDate: "",
    latitude: "",
    longitude: "",
    ...(effectiveEnergyType === "wind" ? { height: "" } : {}),
    location: "", // Initialize location property
  });

  const [formKey, setFormKey] = useState(0);
  const [resetMap, setResetMap] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false); // State for the dialog

  // Form validation setup remains the same...
  const getAssessmentFormData = (): AssessmentFormData => {
      if (effectiveEnergyType === "solar") {
        return {
          ...formData,
          tilt: "",
          azimuth: "",
          tracking: "",
          capacity: "",
        };
      } else {
        return {
          ...formData,
          hubHeight: "",
          powerCurveModel: "",
        };
      }
    };
  const { isFormValid: isSolarFormValid } = useAssessmentFormValidation(
      getAssessmentFormData(),
      effectiveEnergyType,
    );
  const isWindFormValid = (): boolean => {
      return (
        !!formData.startDate &&
        !!formData.endDate &&
        !!formData.latitude &&
        !!formData.longitude &&
        !!formData.height &&
        validateDate(formData.startDate, effectiveEnergyType) &&
        validateEndDate(
          formData.startDate,
          formData.endDate,
          effectiveEnergyType,
        ) &&
        validateLatitudeFormat(formData.latitude) &&
        validateLongitudeFormat(formData.longitude)
      );
    };
  const isFormValid = (): boolean => {
      if (effectiveEnergyType === "solar") {
        return isSolarFormValid();
      } else {
        return isWindFormValid();
      }
    };
  // End of validation setup

  // --- Mutations ---
  const solarMutation = useMutation<
    SolarAssessmentApiResponse,
    AxiosError,
    BasicSolarAssessmentRequest
  >({
    mutationFn: submitBasicSolarAssessment,
    onSuccess: () => {
      handleClear();
      setIsSuccessDialogOpen(true); // Open dialog on success
    },
    onError: (error: AxiosError) => {
      console.error("Solar assessment error:", error);
      // Optionally add user-facing error handling here
    },
  });

  const windMutation = useMutation<
    WindAssessmentApiResponse,
    AxiosError,
    BasicWindAssessmentRequest
  >({
    mutationFn: submitBasicWindAssessment,
    onSuccess: () => {
      handleClear();
      setIsSuccessDialogOpen(true); // Open dialog on success
    },
    onError: (error: AxiosError) => {
      console.error("Wind assessment error:", error);
       // Optionally add user-facing error handling here
    },
  });

  const isLoading = solarMutation.isPending || windMutation.isPending;
  const error = solarMutation.error || windMutation.error; // Keep error handling for feedback

  // --- Form Actions ---
  const handleClear = () => {
    setFormData({
      startDate: "",
      endDate: "",
      latitude: "",
      longitude: "",
      height: "",
      location: "", // Reset location property
    });
    inputRefs.current.forEach((ref) => {
      if (ref.current) {
        ref.current.resetValidation();
      }
    });
    solarMutation.reset();
    windMutation.reset();
    setResetMap(true);
    setTimeout(() => setResetMap(false), 100);
    setFormKey((prevKey) => prevKey + 1);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const isLatitudeFormatValid = validateLatitudeFormat(formData.latitude);
    const isLongitudeFormatValid = validateLongitudeFormat(formData.longitude);
    if (!isLatitudeFormatValid || !isLongitudeFormatValid) return;

    if (isFormValid()) {
      if (effectiveEnergyType === "solar") {
        const solarRequest: BasicSolarAssessmentRequest = {
          location: formData.location ?? '', // Ensure string
          startDate: formatToISO(formData.startDate) || formData.startDate,
          endDate: formatToISO(formData.endDate) || formData.endDate,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        };
        solarMutation.mutate(solarRequest);
      } else {
        const windRequest: BasicWindAssessmentRequest = {
          location: formData.location ?? '', // Ensure string
          startDate: formatToISO(formData.startDate) || formData.startDate,
          endDate: formatToISO(formData.endDate) || formData.endDate,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          height: parseFloat(formData.height || "10"),
        };
        windMutation.mutate(windRequest);
      }
    }
  };

  const handleInputChange = (field: keyof FormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // --- Effect for energy type change ---
  useEffect(() => {
    if (
      prevEnergyTypeRef.current !== null &&
      prevEnergyTypeRef.current !== energyType
    ) {
       // Simplified reset logic directly here
       setFormData({
          startDate: "",
          endDate: "",
          latitude: "",
          longitude: "",
          height: "",
          location: "", // Reset location property
        });
        inputRefs.current.forEach((ref) => {
          if (ref.current) {
            ref.current.resetValidation();
          }
        });
        solarMutation.reset();
        windMutation.reset();
        setFormKey((prevKey) => prevKey + 1);
    }
    prevEnergyTypeRef.current = energyType;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [energyType]); // Keep dependency only on energyType

  // --- Render ---
  return (
    <>
      <div className="space-y-6">
        {/* Section Header */}
        <Card>
          <SectionHeader
            title={
              effectiveEnergyType === "solar"
                ? t(
                    "assessment.basic.solar.title",
                    "Retrieve Monthly Mean Solar Radiation Data",
                  )
                : t(
                    "assessment.basic.wind.title",
                    "Retrieve Wind Speed data and energy resource assessment",
                  )
            }
            description={
              effectiveEnergyType === "solar" ? (
                <SolarAssessmentBasic />
              ) : (
                <WindAssessmentBasic />
              )
            }
          />
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Inputs Layout */}
          <Card>
            <AssessmentInputsLayout
              formType="basic"
              energyType={effectiveEnergyType}
              formData={formData}
              formKey={formKey}
              resetMap={resetMap}
              handleInputChange={(field: string) => (value: string) => {
                handleInputChange(field as keyof FormData)(value);
              }}
              validateDate={validateDate}
              validateEndDate={validateEndDate}
              validateRequired={validateRequired}
              validateLatitudeFormat={validateLatitudeFormat}
              validateLongitudeFormat={validateLongitudeFormat}
              getFieldRef={getFieldRef}
            />
          </Card>

          {/* Loading/Error Feedback */}
          {isLoading && (
            <div className="my-4 rounded bg-blue-50 p-3 text-blue-700">
              {t("assessment.common.loading", "Processing your request...")}
            </div>
          )}
          {error && (
            <div className="my-4 rounded bg-red-50 p-3 text-red-700">
              {t(
                "assessment.common.error.submission",
                "Error submitting assessment",
              )}
              : {error.message}
            </div>
          )}

          {/* Form Actions */}
          <FormActions
            onClear={handleClear}
            onSubmit={handleSubmit}
            isSubmitDisabled={!isFormValid() || isLoading}
            submitButtonText={
              effectiveEnergyType === "solar"
                ? t("assessment.common.order", "ORDER")
                : t("assessment.common.send", "SEND")
            }
            clearButtonText={t("assessment.common.clear", "CLEAR")}
          />

          {/* Success Dialog */}
          <SuccessDialog
            isOpen={isSuccessDialogOpen}
            onClose={() => setIsSuccessDialogOpen(false)}
            onNavigate={() => {
              setIsSuccessDialogOpen(false);
              navigate({ to: '/archive' }); // Correct usage for TanStack Router
            }}
            title="Submission Successful"
            message="Your assessment request has been submitted. You will be notified upon completion, and the results will be available in the Archive section."
          />
        </form>

        {/* Results display removed */}
      </div>
    </>
  );
};

export default BasicTab;
