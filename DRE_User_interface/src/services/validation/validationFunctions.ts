// validationFunctions.ts
// Common validation functions for form inputs

/**
 * Validates a date string (YYYY-MM-DD format)
 */
export function validateDate(date: string): boolean {
  if (!date) return false;
  
  // Check format using regex (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  // Check if it's a valid date
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Validates latitude (-90 to 90)
 */
export function validateLatitude(latitude: string): boolean {
  if (!latitude) return false;
  
  const lat = parseFloat(latitude);
  return !isNaN(lat) && lat >= -90 && lat <= 90;
}

/**
 * Validates longitude (-180 to 180)
 */
export function validateLongitude(longitude: string): boolean {
  if (!longitude) return false;
  
  const lng = parseFloat(longitude);
  return !isNaN(lng) && lng >= -180 && lng <= 180;
}

/**
 * Validates a generic number
 */
export function validateNumber(value: string): boolean {
  if (!value) return false;
  
  const num = parseFloat(value);
  return !isNaN(num);
}

/**
 * Validates tilt angle (0 to 90 degrees)
 */
export function validateTilt(tilt: string): boolean {
  if (!tilt) return false;
  
  const tiltValue = parseFloat(tilt);
  return !isNaN(tiltValue) && tiltValue >= 0 && tiltValue <= 90;
}

/**
 * Validates azimuth angle (0 to 360 degrees)
 */
export function validateAzimuth(azimuth: string): boolean {
  if (!azimuth) return false;
  
  const azimuthValue = parseFloat(azimuth);
  return !isNaN(azimuthValue) && azimuthValue >= 0 && azimuthValue <= 360;
}

/**
 * Validates a positive number
 */
export function validatePositiveNumber(value: string): boolean {
  if (!value) return false;
  
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

/**
 * Validates a non-negative number (zero or positive)
 */
export function validateNonNegativeNumber(value: string): boolean {
  if (!value) return false;
  
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
}

/**
 * Validates a percentage (0-100)
 */
export function validatePercentage(value: string): boolean {
  if (!value) return false;
  
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num <= 100;
}

/**
 * Validates a required field is not empty
 */
export function validateRequired(value: string): boolean {
  return !!value && value.trim() !== '';
}

/**
 * Validates an email address
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
