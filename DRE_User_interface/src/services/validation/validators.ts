/**
 * Centralized validation functions for form inputs
 * These functions can be used with the ValidatedInput component
 */
import { validateDate as timeUtilsValidateDate, validateEndDate as timeUtilsValidateEndDate, getFormattedDateRange } from "../../utils/TimeUtils";

/**
 * Validates a date string
 * @param value - Date string to validate
 * @returns True if date is valid, false otherwise
 */
export const validateDate = (value: string, energyType: "solar" | "wind"): boolean => {
  return timeUtilsValidateDate(value, energyType);
};

/**
 * Validates that end date is after or equal to start date
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns True if end date is valid and after start date, false otherwise
 */
export const validateEndDate = (startDate: string, endDate: string, energyType: "solar" | "wind"): boolean => {
  return timeUtilsValidateEndDate(startDate, endDate, energyType);
};

/**
 * Validates latitude value (-90 to 90)
 * @param value - Latitude string to validate
 * @returns True if latitude is valid, false otherwise
 */
export const validateLatitude = (value: string): boolean => {
  if (!value) return false;
  // First check if the value is a properly formatted number
  if (!validateDecimalFormat(value)) return false;
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num) && num >= -90 && num <= 90;
};

/**
 * Validates longitude value (-180 to 180)
 * @param value - Longitude string to validate
 * @returns True if longitude is valid, false otherwise
 */
export const validateLongitude = (value: string): boolean => {
  if (!value) return false;
  // First check if the value is a properly formatted number
  if (!validateDecimalFormat(value)) return false;
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num) && num >= -180 && num <= 180;
};

/**
 * Validates elevation value (any number)
 * @param value - Elevation string to validate
 * @returns True if elevation is a valid number, false otherwise
 */
export const validateElevation = (value: string): boolean => {
  if (!value) return false;
  // First check if the value is a properly formatted number
  if (!validateDecimalFormat(value)) return false;
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num) && num >= 0 && num <= 8849;
};

/**
 * Validates a positive number
 * @param value - Number string to validate
 * @returns True if value is a positive number, false otherwise
 */
export const validatePositiveNumber = (value: string): boolean => {
  if (!value) return false;
  // First check if the value is a properly formatted number
  if (!validateDecimalFormat(value)) return false;
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num) && num > 0;
};

/**
 * Validates a number (can be positive or negative)
 * @param value - Number string to validate
 * @returns True if value is a number, false otherwise
 */
export const validateNumber = (value: string): boolean => {
  if (!value) return false;
  // First check if the value is a properly formatted number
  if (!validateDecimalFormat(value)) return false;
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num);
};

/**
 * Validates azimuth value (0 to 360)
 * @param value - Azimuth string to validate
 * @returns True if azimuth is valid, false otherwise
 */
export const validateAzimuth = (value: string): boolean => {
  if (!value) return false;
  // First check if the value is a properly formatted number
  if (!validateDecimalFormat(value)) return false;
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num) && num >= 0 && num <= 360;
};

/**
 * Validates tilt value (0 to 90)
 * @param value - Tilt string to validate
 * @returns True if tilt is valid, false otherwise
 */
export const validateTilt = (value: string): boolean => {
  if (!value) return false;
  // First check if the value is a properly formatted number
  if (!validateDecimalFormat(value)) return false;
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num) && num >= 0 && num <= 90;
};

/**
 * Validates hub height value (40 to 300)
 * @param value - Hub height string to validate
 * @returns True if hub height is valid, false otherwise
 */
export const validateHubHeight = (value: string): boolean => {
  if (!value) return false;
  // First check if the value is a properly formatted number
  if (!validateDecimalFormat(value)) return false;
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num) && num >= 40 && num <= 300;
};

/**
 * Validates that a string is not empty
 * @param value - String to validate
 * @returns True if string is not empty, false otherwise
 */
export const validateRequired = (value: string): boolean => {
  return value.trim() !== "";
};

/**
 * Validates that a string is a properly formatted decimal number
 * Only accepts numbers with a dot (.) as decimal separator
 * Examples: "123", "123.45" are valid, "123,45", "123.4r" are invalid
 * @param value - String to validate
 * @returns True if string is a properly formatted decimal number, false otherwise
 */
export const validateDecimalFormat = (value: string): boolean => {
  if (!value) return false;
  // This regex matches only numbers with optional decimal point
  // It allows: "123", "123.45", "-123.45"
  // It rejects: "123,45", "123.4r", "r123.45", "123abc"
  return /^-?\d+(\.\d+)?$/.test(value.trim());
};

/**
 * Enhanced latitude validation that checks both range and decimal format
 * @param value - Latitude string to validate
 * @returns True if latitude is valid and properly formatted, false otherwise
 */
export const validateLatitudeFormat = (value: string): boolean => {
  if (!validateDecimalFormat(value)) return false;
  return validateLatitude(value);
};

/**
 * Enhanced longitude validation that checks both range and decimal format
 * @param value - Longitude string to validate
 * @returns True if longitude is valid and properly formatted, false otherwise
 */
export const validateLongitudeFormat = (value: string): boolean => {
  if (!validateDecimalFormat(value)) return false;
  return validateLongitude(value);
};

/**
 * Enhanced positive number validation that checks both value and decimal format
 * @param value - Number string to validate
 * @returns True if value is a positive number and properly formatted, false otherwise
 */
export const validatePositiveNumberFormat = (value: string): boolean => {
  if (!validateDecimalFormat(value)) return false;
  return validatePositiveNumber(value);
};

/**
 * Generates a date validation error message with the specific date range
 * @param energyType - Type of energy ("solar" or "wind") to determine the valid date range
 * @returns Error message string with the valid date range
 */
export const getDateValidationErrorMessage = (energyType: "solar" | "wind" = "solar"): string => {
  const { earliestDate, latestDate } = getFormattedDateRange(energyType);
  
  return `Please enter a valid date between ${earliestDate} and ${latestDate}.`;
};

/**
 * Generates an end date validation error message
 * @returns Error message string for end date validation
 */
export const getEndDateValidationErrorMessage = (): string => {
  return "End date must be on or after the start date.";
};
