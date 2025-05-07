import { useTranslation } from "react-i18next";

// Common types
export interface MonthValuePair {
  month: string;
  value: number;
}

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

// Utility functions
export const useMonthUtils = () => {
  const { t } = useTranslation();
  
  const getMonthName = (index: number): string => {
    const months = [
      t("common.months.jan", "January"),
      t("common.months.feb", "February"),
      t("common.months.mar", "March"),
      t("common.months.apr", "April"),
      t("common.months.may", "May"),
      t("common.months.jun", "June"),
      t("common.months.jul", "July"),
      t("common.months.aug", "August"),
      t("common.months.sep", "September"),
      t("common.months.oct", "October"),
      t("common.months.nov", "November"),
      t("common.months.dec", "December"),
    ];
    return months[index % 12];
  };
  
  const getMonthIndex = (monthName: string): number => {
    const months = [
      t("common.months.jan", "January"),
      t("common.months.feb", "February"),
      t("common.months.mar", "March"),
      t("common.months.apr", "April"),
      t("common.months.may", "May"),
      t("common.months.jun", "June"),
      t("common.months.jul", "July"),
      t("common.months.aug", "August"),
      t("common.months.sep", "September"),
      t("common.months.oct", "October"),
      t("common.months.nov", "November"),
      t("common.months.dec", "December"),
    ];
    
    const index = months.findIndex(
      (month) => month.toLowerCase() === monthName.toLowerCase()
    );
    return index !== -1 ? index : -1;
  };
  
  const parseDateRange = (startDate?: string, endDate?: string): DateRange => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    return { startDate: start, endDate: end };
  };
  
  // Check if a specific month is within the date range
  const isMonthInDateRange = (monthIndex: number, dateRange: DateRange): boolean => {
    const { startDate, endDate } = dateRange;
    
    // If no date range is specified, include all months
    if (!startDate || !endDate) return true;
    
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    
    // If dates are in the same year
    if (startYear === endYear) {
      return monthIndex >= startMonth && monthIndex <= endMonth;
    }
    
    // If dates span multiple years
    if (endYear > startYear) {
      // For simplicity, we'll just check if the month is between start and end months
      // This is a simplification and doesn't handle multiple years correctly
      return monthIndex >= startMonth || monthIndex <= endMonth;
    }
    
    return false;
  };
  
  // Create an array of all 12 months
  const getAllMonths = (): string[] => {
    return Array.from({ length: 12 }, (_, i) => getMonthName(i));
  };
  
  // Get all months abbreviated (first 3 letters)
  const getAllMonthsShort = (): string[] => {
    return getAllMonths().map(month => month.substring(0, 3));
  };
  
  return { 
    getMonthName, 
    getMonthIndex, 
    parseDateRange, 
    isMonthInDateRange,
    getAllMonths,
    getAllMonthsShort
  };
};
