import React, { useState, useEffect } from "react";
import { getDateValidationErrorMessage, getEndDateValidationErrorMessage } from "../../services/validation/validators";
import CustomDateInput from "./CustomDateInput";
import { validateDate } from "../../utils/TimeUtils";

interface DateRangeInputsProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  validateStartDate: (value: string, energyType: "solar" | "wind") => boolean;
  validateEndDate: (startDate: string, endDate: string) => boolean;
  energyType: "solar" | "wind";
}

const DateRangeInputs = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  validateStartDate,
  validateEndDate,
  energyType,
}: DateRangeInputsProps): React.ReactNode => {
  const [startDateTouched, setStartDateTouched] = useState(false);
  const [endDateTouched, setEndDateTouched] = useState(false);
  const [hasInvalidEndDateAttempt, setHasInvalidEndDateAttempt] = useState(false);

  useEffect(() => {
    if (endDate && validateDate(endDate, energyType)) {
      setHasInvalidEndDateAttempt(false);
    }
  }, [endDate, energyType]);

  const isEndDateBasicValid = endDate && validateDate(endDate, energyType);
  const isEndDateRelationValid = startDate && endDate && validateDate(endDate, energyType) && validateEndDate(startDate, endDate);

  const getEndDateErrorMessage = () => {
    if (!isEndDateBasicValid || hasInvalidEndDateAttempt) {
      return getDateValidationErrorMessage(energyType);
    }
    return getEndDateValidationErrorMessage();
  };

  const shouldShowEndDateError = endDateTouched && (hasInvalidEndDateAttempt || (endDate && (!isEndDateBasicValid || !isEndDateRelationValid)));

  return (
    <>
      {/* Start Date Input */}
      <div className="relative mb-16">
        <div className="h-16">
          <CustomDateInput
            id="startDate"
            value={startDate}
            onChange={(value) => {
              onStartDateChange(value);
              setStartDateTouched(true);
            }}
            onBlur={() => setStartDateTouched(true)}
            placeholder="dd/mm/yyyy"
            className="h-16 w-full border-2 p-2 pt-4 text-gray-500 focus:outline-none focus:ring-0"
          />
        </div>
        <label
          className="absolute -top-2.5 left-2 bg-white px-1 text-xs font-medium text-gray-400"
          htmlFor="startDate"
        >
          Start Date
        </label>
        {startDateTouched && !validateStartDate(startDate, energyType) && (
          <div className="text-red-500 text-sm mt-1 absolute">
            {getDateValidationErrorMessage(energyType)}
          </div>
        )}
      </div>

      {/* End Date Input */}
      <div className="relative mb-8">
        <div className="h-16">
          <CustomDateInput
            id="endDate"
            value={endDate}
            onChange={(value) => {
              setEndDateTouched(true);
              if (!value) setHasInvalidEndDateAttempt(true);
              onEndDateChange(value);
            }}
            onBlur={() => {
              setEndDateTouched(true);
              if (!endDate) setHasInvalidEndDateAttempt(true);
            }}
            placeholder="dd/mm/yyyy"
            className="h-16 w-full border-2 p-2 pt-4 text-gray-500 focus:outline-none focus:ring-0"
          />
        </div>
        <label
          className="absolute -top-2.5 left-2 bg-white px-1 text-xs font-medium text-gray-400"
          htmlFor="endDate"
        >
          End Date
        </label>
        {shouldShowEndDateError && (
          <div className="text-red-500 text-sm mt-1 absolute">
            {getEndDateErrorMessage()}
          </div>
        )}
      </div>
    </>
  );
};

export default DateRangeInputs;
