/**
 * Date format utility functions for consistent date handling across the application
 */

/**
 * Formats a date string to DD/MM/YYYY format
 * @param dateString - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string (DD/MM/YYYY)
 */
export const formatDateToDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // Split the ISO date string
    const [year, month, day] = dateString.split('-');
    
    // Return the formatted date
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Parses a DD/MM/YYYY formatted date string to ISO format (YYYY-MM-DD)
 * @param displayDate - Date string in DD/MM/YYYY format
 * @returns ISO date string (YYYY-MM-DD)
 */
export const parseDisplayDateToISO = (displayDate: string): string => {
  if (!displayDate) return '';
  
  // If already in ISO format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(displayDate)) {
    return displayDate;
  }
  
  try {
    // Split the DD/MM/YYYY format
    const [day, month, year] = displayDate.split('/');
    
    // Return the ISO format
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error parsing display date:', error);
    return '';
  }
};
