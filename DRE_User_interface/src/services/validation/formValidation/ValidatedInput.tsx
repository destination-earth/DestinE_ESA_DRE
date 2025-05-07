import React, { useState, useImperativeHandle, forwardRef } from 'react';

interface ValidatedInputProps {
  value: "";
  onChange: (value: string) => void;
  validate: (value: string) => boolean;
  errorMessage: string;
  id?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // For additional props that might be passed to the input element
}

// Define the ref type for the component
export interface ValidatedInputRef {
  resetValidation: () => void;
}

const ValidatedInput = forwardRef<ValidatedInputRef, ValidatedInputProps>(({
  value,
  onChange,
  validate,
  errorMessage,
  className,
  ...inputProps
}, ref) => {
  const [touched, setTouched] = useState(false);
  const isValid = validate(value);

  // Expose the resetValidation method to parent components
  useImperativeHandle(ref, () => ({
    resetValidation: () => {
      setTouched(false);
    }
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  return (
    <div className="mb-4">
      <input
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`${className || 'w-full p-2'} ${touched && !isValid ? 'border-red-500' : 'border-gray-300'}`}
        {...inputProps}
      />
      {touched && !isValid && (
        <div className="text-red-500 text-sm mt-1">
          {errorMessage}
        </div>
      )}
    </div>
  );
});

export default ValidatedInput;
