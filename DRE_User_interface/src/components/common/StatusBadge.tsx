import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

export type StatusType = 'Pending' | 'Completed' | 'Failed' | 'Processing' | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

/**
 * A reusable badge component for displaying job status
 * with appropriate styling based on the status value
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const { t } = useTranslation();
  
  // Determine the appropriate styling based on status
  const getBadgeClasses = (status: StatusType) => {
    const baseClasses = "px-3 py-1.5 rounded-full text-sm inline-block min-w-[80px] text-center";
    
    // Convert to lowercase for case-insensitive comparison
    const normalizedStatus = status.toLowerCase();
    
    switch(normalizedStatus) {
      case 'pending':
        return classNames(baseClasses, "bg-yellow-100 text-yellow-700", className);
      case 'completed':
        return classNames(baseClasses, "bg-green-100 text-green-700", className);
      case 'failed':
        return classNames(baseClasses, "bg-red-100 text-red-700", className);
      case 'processing':
        return classNames(baseClasses, "bg-blue-100 text-blue-700", className);
      default:
        return classNames(baseClasses, "bg-gray-100 text-gray-700", className);
    }
  };
  
  // Translate the status if a translation key exists
  const getTranslatedStatus = (status: StatusType) => {
    const translationKey = `job.status.${status.toLowerCase()}`;
    const translated = t(translationKey, status);
    return translated;
  };
  
  return (
    <span className={getBadgeClasses(status)}>
      {getTranslatedStatus(status)}
    </span>
  );
};

export default StatusBadge;
