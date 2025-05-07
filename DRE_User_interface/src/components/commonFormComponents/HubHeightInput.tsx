import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import FloatingLabelInput from "./FloatingLabelInput";

// Define the ref type for the component
export interface ValidatedInputRef {
  resetValidation: () => void;
}

interface HubHeightInputProps {
  value: string;
  onChange: (value: string) => void;
  validate?: (value: string) => boolean;
  errorMessage?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  inputRef?: React.RefObject<ValidatedInputRef>;
}

const HubHeightInput: React.FC<HubHeightInputProps> = ({
  value,
  onChange,
  validate = () => true,
  errorMessage = "Please enter a valid hub height",
  placeholder = "Enter hub height (m)",
  min = 40,
  max = 300,
  step = 1,
  inputRef,
}) => {
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const inputElementRef = useRef<HTMLInputElement>(null);

  // Expose the resetValidation method to parent components if inputRef is provided
  if (inputRef) {
    // @ts-expect-error - This is a workaround for the ref type issue
    inputRef.current = {
      resetValidation: () => {
        setTouched(false);
        setIsValid(true);
      }
    };
  }

  // Validate the input whenever the value changes
  useEffect(() => {
    if (touched) {
      setIsValid(validate(value));
    }
  }, [value, touched, validate]);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setTouched(true);
  };

  const handleBlur = () => {
    setTouched(true);
    setIsValid(validate(value));
  };

  const increment = () => {
    const currentValue = parseFloat(value) || min;
    const newValue = Math.min(currentValue + step, max);
    onChange(newValue.toString());
    setTouched(true);
  };

  const decrement = () => {
    const currentValue = parseFloat(value) || min;
    const newValue = Math.max(currentValue - step, min);
    onChange(newValue.toString());
    setTouched(true);
  };

  return (
    <div className="w-full">
      <FloatingLabelInput
        id="hubHeight"
        label="Hub Height (m)"
        className="relative"
      >
        <div className="flex h-16 items-center border-2">
          <button
            type="button"
            className="ml-2 flex h-8 w-8 items-center justify-center rounded-s bg-gray-300 text-gray-600"
            onClick={decrement}
          >
            <FontAwesomeIcon icon={faMinus} />
          </button>
          <input
            id="hubHeight"
            type="text"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`w-full h-full border-0 p-2 text-center text-gray-500 focus:outline-none focus:ring-0 ${touched && !isValid ? 'border-red-500' : ''}`}
            ref={inputElementRef}
          />
          <button
            type="button"
            className="mr-2 flex h-8 w-8 items-center justify-center rounded-e bg-gray-300 text-gray-600"
            onClick={increment}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </FloatingLabelInput>
      {/* Reserve space for error message to prevent layout shifts */}
      <div className="h-0 mt-4">
        {touched && !isValid && (
          <div className="text-red-500 text-sm">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default HubHeightInput;
