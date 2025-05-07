import { format, parse, parseISO, isValid, isBefore, isAfter } from "date-fns";

/**
 * Convert ISO date (YYYY-MM-DD) to DD/MM/YYYY for display
 */
export const formatToDisplay = (isoDate?: string): string => {
  if (!isoDate) return "";
  try {
    return format(parseISO(isoDate), "dd/MM/yyyy");
  } catch (error) {
    console.error("Error formatting date to display:", error);
    return "";
  }
};

/**
 * Convert user input (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
 */
export const formatToISO = (displayDate: string): string | null => {
  if (!displayDate) return null;
  try {
    const parsedDate = parse(displayDate, "dd/MM/yyyy", new Date());
    if (!isValid(parsedDate)) return null;
    return format(parsedDate, "yyyy-MM-dd");
  } catch (error) {
    console.error("Error formatting date to ISO:", error);
    return null;
  }
};

/**
 * Validates if a string is a valid ISO date with exactly 4-digit year
 */
export const isValidISODate = (isoDate: string): boolean => {
  if (!isoDate) return false;
  
  // Check for exactly 4-digit year format (YYYY-MM-DD)
  if (!isoDate.match(/^\d{4}-\d{2}-\d{2}$/)) return false;
  
  // Validate date is actually valid
  const date = parseISO(isoDate);
  return isValid(date);
};

/**
 * Validates a date string against application requirements
 * - Must be a valid date in YYYY-MM-DD format with exactly 4-digit year
 * - Must be between Feb 1, 2004 and two days ago
 */
export const validateDate = (value: string, energyType: "solar" | "wind"): boolean => {
  if (!value) return false;
  
  // Check if the format is valid with exactly 4-digit year
  if (!isValidISODate(value)) return false;
  
  const date = parseISO(value);
  
  // Get current date and subtract 7 days
  const today = new Date();
  const aWeekAgo = new Date(today);
  aWeekAgo.setDate(today.getDate() - 7);
  
  // Set time to beginning of day for accurate comparison
  aWeekAgo.setHours(0, 0, 0, 0);
  
  // Define the earliest allowed date (February 1, 2004)
  // const earliestDate = new Date(2004, 1, 1); // Month is 0-indexed, so 1 = February

  let earliestDate;
  if (energyType === 'wind') {
    // Define wind-specific earliest date
    earliestDate = new Date(1939, 11, 31);
  } else {
    // Default or solar-specific earliest date
    earliestDate = new Date(2003, 11, 31); // February 1, 2004
  }
  
  // Check if date is within the allowed range
  return isBefore(date, aWeekAgo) && isAfter(date, earliestDate);
};

/**
 * Validates that end date is after or equal to start date
 */
export const validateEndDate = (startDate: string, endDate: string, energyType: "solar" | "wind" = "solar"): boolean => {
  if (!validateDate(endDate, energyType)) return false;
  if (!startDate) return true;
  
  // Check if start date is valid according to our date validation rules
  if (!isValidISODate(startDate)) return true;
  
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  return isValid(start) && isValid(end) && (end >= start);
};

/**
 * Get formatted date range for display in error messages
 */
export const getFormattedDateRange = (energyType: "solar" | "wind" = "solar"): { earliestDate: string; latestDate: string } => {
  // Define the earliest allowed date based on energy type
  let earliestDate;
  if (energyType === 'wind') {
    earliestDate = new Date(1939, 11, 31); // February 1, 1940 for wind
  } else {
    earliestDate = new Date(2003, 11, 31); // February 1, 2004 for solar
  }
  
  // Get current date and subtract 7 days
  const today = new Date();
  const aWeekAgo = new Date(today);
  aWeekAgo.setDate(today.getDate() - 7);
  
  return {
    earliestDate: format(earliestDate, "dd/MM/yyyy"),
    latestDate: format(aWeekAgo, "dd/MM/yyyy")
  };
};
