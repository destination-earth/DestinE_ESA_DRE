import React, { useState, useEffect, useRef } from "react";
import { formatToDisplay, formatToISO, isValidISODate } from "../../utils/TimeUtils";
import { parse, isValid } from "date-fns";

interface CustomDateInputProps {
  id: string;
  value: string; // ISO format (YYYY-MM-DD)
  onChange: (value: string) => void; // Will receive ISO format
  className?: string;
  placeholder?: string;
  required?: boolean;
  onBlur?: () => void;
}

/**
 * Custom date input component that displays dates in DD/MM/YYYY format
 * while maintaining the native date picker functionality
 */
const CustomDateInput: React.FC<CustomDateInputProps> = ({
  id,
  value,
  onChange,
  className = "",
  placeholder = "dd/mm/yyyy",
  required = false,
  onBlur,
}) => {
  // Reference to the hidden date input
  const dateInputRef = useRef<HTMLInputElement>(null);
  
  // State to track the display value (DD/MM/YYYY)
  const [displayValue, setDisplayValue] = useState<string>("");
  
  // State to track if the current input is valid
  const [isValidInput, setIsValidInput] = useState<boolean>(true);
  
  // Update display value when the ISO value changes
  useEffect(() => {
    if (value) {
      // Only update display value if the ISO date is valid
      if (isValidISODate(value)) {
        setDisplayValue(formatToDisplay(value));
        setIsValidInput(true);
      } else {
        // If ISO date is invalid, keep the display value but mark as invalid
        setIsValidInput(false);
      }
    } else {
      setDisplayValue("");
      setIsValidInput(true);
    }
  }, [value]);
  
  // Validate a date string in DD/MM/YYYY format
  const validateDateString = (dateStr: string): boolean => {
    if (!dateStr || !dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) return false;
    
    const day = parseInt(dateStr.substring(0, 2), 10);
    const month = parseInt(dateStr.substring(3, 5), 10);
    const year = parseInt(dateStr.substring(6, 10), 10);
    
    // Basic validation for day, month, and year
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > 2100) return false;
    
    // More precise validation using date-fns
    const parsedDate = parse(dateStr, "dd/MM/yyyy", new Date());
    return isValid(parsedDate);
  };
  
  // Handle click on the text input to open the date picker
  const handleInputClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };
  
  // Handle change from the hidden date input (ISO format)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoValue = e.target.value;
    if (isoValue) {
      setIsValidInput(true);
    }
    onChange(isoValue);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    let formattedValue = "";
  
    // Apply the mask: DD/MM/YYYY with slashes inserted immediately
    if (inputValue.length > 0) {
      formattedValue = inputValue.substring(0, 1);
    }
    if (inputValue.length > 1) {
      formattedValue += inputValue.substring(1, 2) + "/"; // Add `/` after 2nd digit
    }
    if (inputValue.length > 2) {
      formattedValue += inputValue.substring(2, 3);
    }
    if (inputValue.length > 3) {
      formattedValue += inputValue.substring(3, 4) + "/"; // Add `/` after 4th digit
    }
    if (inputValue.length > 4) {
      formattedValue += inputValue.substring(4, 8); // Append remaining year digits
    }
  
    // Update the display value
    setDisplayValue(formattedValue);
  
    // Check if the input is a complete date (DD/MM/YYYY)
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(formattedValue)) {
      const isDateValid = validateDateString(formattedValue);
      setIsValidInput(isDateValid);
  
      if (isDateValid) {
        const isoValue = formatToISO(formattedValue);
        if (isoValue) {
          onChange(isoValue);
        }
      } else {
        onChange(""); // If invalid, clear the value
      }
    } else if (formattedValue === "") {
      setIsValidInput(true);
      onChange("");
    }
  };
  
  
  // Handle manual text input with masking for DD/MM/YYYY format
  // const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const inputValue = e.target.value;
    
  //   // Remove any non-digit characters
  //   const digitsOnly = inputValue.replace(/\D/g, '');
    
  //   // Apply the mask: DD/MM/YYYY
  //   let formattedValue = '';
    
  //   if (digitsOnly.length > 0) {
  //     // Add first digit of day
  //     formattedValue = digitsOnly.substring(0, 1);
      
  //     // Add second digit of day
  //     if (digitsOnly.length > 1) {
  //       formattedValue = digitsOnly.substring(0, 2);
        
  //       // Add first slash and first digit of month
  //       if (digitsOnly.length > 2) {
  //         formattedValue = `${digitsOnly.substring(0, 2)}/${digitsOnly.substring(2, 3)}`;
          
  //         // Add second digit of month
  //         if (digitsOnly.length > 3) {
  //           formattedValue = `${digitsOnly.substring(0, 2)}/${digitsOnly.substring(2, 4)}`;
            
  //           // Add second slash and start of year
  //           if (digitsOnly.length > 4) {
  //             formattedValue = `${digitsOnly.substring(0, 2)}/${digitsOnly.substring(2, 4)}/${digitsOnly.substring(4, Math.min(8, digitsOnly.length))}`;
  //           }
  //         }
  //       }
  //     }
  //   }
    
  //   // Update the display value with the masked input
  //   setDisplayValue(formattedValue);
    
  //   // Check if the input is a complete date (DD/MM/YYYY)
  //   if (/^\d{2}\/\d{2}\/\d{4}$/.test(formattedValue)) {
  //     // Validate the date
  //     const isDateValid = validateDateString(formattedValue);
  //     setIsValidInput(isDateValid);
      
  //     if (isDateValid) {
  //       // Convert to ISO format and update parent component
  //       const isoValue = formatToISO(formattedValue);
  //       if (isoValue) {
  //         onChange(isoValue);
  //       }
  //     } else {
  //       // If the date is invalid, pass an empty string to trigger validation
  //       onChange("");
  //     }
  //   } else if (formattedValue === "") {
  //     // If the field is cleared, pass an empty string
  //     setIsValidInput(true);
  //     onChange("");
  //   } else {
  //     // Partial input - keep the current value but don't update parent yet
  //     // This allows the user to type without triggering validation errors
  //   }
  // };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, ctrl+a, ctrl+c, ctrl+v
    if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V
        (e.ctrlKey && [65, 67, 86].indexOf(e.keyCode) !== -1) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    
    // Block any key that isn't a number
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
        (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };
  
  const handleBlur = () => {
    if (onBlur) {
      onBlur();
    }
    
    // Validate the date format on blur
    if (displayValue) {
      // Check if the format is correct
      if (!(/^\d{2}\/\d{2}\/\d{4}$/.test(displayValue))) {
        // If the format is invalid, try to fix it or clear it
        if (displayValue.length > 0) {
          const digitsOnly = displayValue.replace(/\D/g, '');
          
          // If we have enough digits for a complete date, format it
          if (digitsOnly.length === 8) {
            const formattedValue = `${digitsOnly.substring(0, 2)}/${digitsOnly.substring(2, 4)}/${digitsOnly.substring(4, 8)}`;
            setDisplayValue(formattedValue);
            
            // Validate the date
            const isDateValid = validateDateString(formattedValue);
            setIsValidInput(isDateValid);
            
            if (isDateValid) {
              // Convert to ISO format and update parent component
              const isoValue = formatToISO(formattedValue);
              if (isoValue) {
                onChange(isoValue);
              }
            } else {
              // If the date is invalid, pass an empty string to trigger validation
              onChange("");
            }
          } else if (value) {
            // If we don't have enough digits but have a valid value, revert to it
            setDisplayValue(formatToDisplay(value));
            setIsValidInput(true);
          }
        }
      } else {
        // Format is correct, validate the date
        const isDateValid = validateDateString(displayValue);
        setIsValidInput(isDateValid);
        
        if (!isDateValid) {
          // If the date is invalid, pass an empty string to trigger validation
          onChange("");
        } else {
          // If valid, ensure the parent has the correct ISO value
          const isoValue = formatToISO(displayValue);
          if (isoValue) {
            onChange(isoValue);
          }
        }
      }
    }
  };
  
  return (
    <div className="relative flex items-center w-full">
      {/* Visible text input (DD/MM/YYYY format) */}
      <input
        id={id}
        type="text"
        value={displayValue}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${className} ${!isValidInput ? "border-red-500" : ""} pr-10`} // Add padding for the calendar icon
        required={required}
        maxLength={10} // DD/MM/YYYY = 10 characters
        autoComplete="off"
      />
      
      {/* Calendar icon */}
      <button
        type="button"
        className="absolute right-3 text-gray-500 focus:outline-none"
        onClick={handleInputClick}
        tabIndex={-1}
        aria-label="Open date picker"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      
      {/* Hidden date input for the native date picker */}
      <input
        ref={dateInputRef}
        type="date"
        value={value}
        onChange={handleDateChange}
        className="absolute opacity-0 w-0 h-0"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
};

export default CustomDateInput;
