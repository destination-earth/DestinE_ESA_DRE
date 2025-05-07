import React from "react";
import ValidatedInput, { ValidatedInputRef } from "../../services/validation/formValidation/ValidatedInput";
import FloatingLabelInput from "./FloatingLabelInput";
import { useTranslation } from "react-i18next";

interface CoordinateInputsProps {
  latitude: string;
  longitude: string;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
  validateLatitude: (value: string) => boolean;
  validateLongitude: (value: string) => boolean;
  // Optional elevation props
  elevation?: string;
  onElevationChange?: (value: string) => void;
  validateElevation?: (value: string) => boolean;
  // Optional className props for positioning
  containerClassName?: string;
  latitudeContainerClassName?: string;
  longitudeContainerClassName?: string;
  elevationContainerClassName?: string;
  // Refs for validation reset
  latitudeRef?: React.RefObject<ValidatedInputRef>;
  longitudeRef?: React.RefObject<ValidatedInputRef>;
  elevationRef?: React.RefObject<ValidatedInputRef>;
}

const CoordinateInputs = ({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  validateLatitude,
  validateLongitude,
  elevation,
  onElevationChange,
  validateElevation,
  containerClassName = "",
  latitudeContainerClassName = "",
  longitudeContainerClassName = "",
  elevationContainerClassName = "",
  latitudeRef,
  longitudeRef,
  elevationRef,
}: CoordinateInputsProps): React.ReactNode => {
  const { t } = useTranslation();
  
  return (
    <div className={containerClassName}>
      <div className={`${latitudeContainerClassName} mb-24`}>
        <FloatingLabelInput 
          id="latitude" 
          label={t("forecast.oneoff.field.latitude", "Latitude")}
        >
          <ValidatedInput
            id="latitude"
            type="text"
            value={latitude}
            onChange={onLatitudeChange}
            validate={validateLatitude}
            errorMessage={t(
              "forecast.oneoff.validation.latitude",
              "Please enter a valid latitude (-90.0 to 90.0)"
            )}
            placeholder={t(
              "forecast.oneoff.placeholder.latitude",
              "Enter latitude (-90.0 to 90.0)"
            )}
            className="w-full border-2 p-2 text-gray-500 focus:outline-none focus:ring-0 h-16"
            ref={latitudeRef}
          />
        </FloatingLabelInput>
      </div>

      <div className={`${longitudeContainerClassName} mb-24`}>
        <FloatingLabelInput
          id="longitude"
          label={t("forecast.oneoff.field.longitude", "Longitude")}
        >
          <ValidatedInput
            id="longitude"
            type="text"
            value={longitude}
            onChange={onLongitudeChange}
            validate={validateLongitude}
            errorMessage={t(
              "forecast.oneoff.validation.longitude",
              "Please enter a valid longitude (-180.0 to 180.0)"
            )}
            placeholder={t(
              "forecast.oneoff.placeholder.longitude",
              "Enter longitude (-180.0 to 180.0)"
            )}
            className="w-full border-2 p-2 text-gray-500 focus:outline-none focus:ring-0 h-16"
            ref={longitudeRef}
          />
        </FloatingLabelInput>
      </div>

      {elevation !== undefined && onElevationChange && validateElevation && (
        <>
          {/* Small spacer div to add just a bit more space between longitude and elevation */}
          <div className="h-2"></div>
          
          <div className={`${elevationContainerClassName} mb-24`}>
            <FloatingLabelInput
              id="elevation"
              label={t("forecast.oneoff.field.elevation", "Elevation (m)")}
            >
              <ValidatedInput
                id="elevation"
                type="text"
                value={elevation}
                onChange={onElevationChange}
                validate={validateElevation}
                errorMessage={t(
                  "forecast.oneoff.validation.elevation",
                  "Elevation must be a valid number between 0 and 8849"
                )}
                placeholder={t(
                  "forecast.oneoff.placeholder.elevation",
                  "Enter elevation"
                )}
                className="w-full border-2 p-2 text-gray-500 focus:outline-none focus:ring-0 h-16"
                ref={elevationRef}
              />
            </FloatingLabelInput>
          </div>
        </>
      )}
    </div>
  );
};

export default CoordinateInputs;
