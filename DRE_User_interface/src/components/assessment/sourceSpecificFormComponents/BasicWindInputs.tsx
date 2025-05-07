import React from "react";
import FloatingLabelSelect from "../../commonFormComponents/FloatingLabelSelect";
import { ValidatedInputRef } from "../../../services/validation/formValidation/ValidatedInput";

interface BasicWindInputsProps {
  height: string;
  onHeightChange: (value: string) => void;
  // This prop is accepted for API consistency with other components
  // but not used since FloatingLabelSelect doesn't support refs
  heightRef?: React.RefObject<ValidatedInputRef>;
}

const BasicWindInputs = ({
  height,
  onHeightChange,
  heightRef,
}: BasicWindInputsProps): React.ReactNode => {
  // Reference heightRef to prevent TS6133 warning
  void heightRef;

  const heightOptions = [
    { value: "10", label: "10m" },
    { value: "100", label: "100m" },
  ];

  return (
    <FloatingLabelSelect
      id="height"
      label="Height (m)"
      value={height}
      onChange={onHeightChange}
      options={heightOptions}
      placeholder="Select height"
    />
  );
};

export default BasicWindInputs;
