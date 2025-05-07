import React from "react";
import FloatingLabelInput from "../../commonFormComponents/FloatingLabelInput";
import FloatingLabelSelect from "../../commonFormComponents/FloatingLabelSelect";
import ValidatedInput, { ValidatedInputRef } from "../../../services/validation/formValidation/ValidatedInput";

interface PremiumSolarInputsProps {
  tilt: string;
  azimuth: string;
  tracking: string;
  capacity: string;
  onTiltChange: (value: string) => void;
  onAzimuthChange: (value: string) => void;
  onTrackingChange: (value: string) => void;
  onCapacityChange: (value: string) => void;
  numberValidation: (value: string) => boolean;
  azimuthValidation: (value: string) => boolean;
  tiltValidation: (value: string) => boolean;
  tiltRef?: React.RefObject<ValidatedInputRef>;
  azimuthRef?: React.RefObject<ValidatedInputRef>;
  capacityRef?: React.RefObject<ValidatedInputRef>;
}

const PremiumSolarInputs = ({
  tilt,
  azimuth,
  tracking,
  capacity,
  onTiltChange,
  onAzimuthChange,
  onTrackingChange,
  onCapacityChange,
  numberValidation,
  azimuthValidation,
  tiltValidation,
  tiltRef,
  azimuthRef,
  capacityRef,
}: PremiumSolarInputsProps): React.ReactNode => {
  return (
    <div className="col-span-4 grid grid-cols-1 gap-6 md:grid-cols-4">
      <FloatingLabelInput id="tilt" label="Tilt">
        <ValidatedInput
          id="tilt"
          type="text"
          value={tilt}
          onChange={onTiltChange}
          validate={tiltValidation}
          errorMessage="Tilt must be a number between 0 and 90 degrees"
          placeholder="Enter tilt (0-90°)"
          className="h-16 w-full border-2 p-2 pt-4 text-gray-500 focus:outline-none focus:ring-0"
          ref={tiltRef}
        />
      </FloatingLabelInput>

      <FloatingLabelInput id="azimuth" label="Azimuth">
        <ValidatedInput
          id="azimuth"
          type="text"
          value={azimuth}
          onChange={onAzimuthChange}
          validate={azimuthValidation}
          errorMessage="Azimuth must be a number between 0 and 360 degrees"
          placeholder="Enter azimuth (0-360°)"
          className="h-16 w-full border-2 p-2 pt-4 text-gray-500 focus:outline-none focus:ring-0"
          ref={azimuthRef}
        />
      </FloatingLabelInput>

      <FloatingLabelSelect
        id="tracking"
        label="Tracking"
        value={tracking || "0"}
        onChange={onTrackingChange}
        options={[
          { value: "0", label: "Fixed" },
          { value: "1", label: "Single Axis" },
          { value: "2", label: "Dual Axis" },
        ]}
        placeholder="Select"
      />

      <FloatingLabelInput id="capacity" label="Capacity">
        <ValidatedInput
          id="capacity"
          type="text"
          value={capacity}
          onChange={onCapacityChange}
          validate={numberValidation}
          errorMessage="Please enter a valid capacity value"
          placeholder="Enter capacity (kW)"
          className="h-16 w-full border-2 p-2 pt-4 text-gray-500 focus:outline-none focus:ring-0"
          ref={capacityRef}
        />
      </FloatingLabelInput>
    </div>
  );
};

export default PremiumSolarInputs;
