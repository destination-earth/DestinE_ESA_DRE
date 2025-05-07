import React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

export type PlanType = 'Basic' | 'Premium' | string;

interface PlanBadgeProps {
  plan: PlanType;
  className?: string;
}

/**
 * A reusable badge component for displaying plan types
 * with appropriate styling based on the plan value
 */
const PlanBadge: React.FC<PlanBadgeProps> = ({ plan, className }) => {
  const { t } = useTranslation();
  
  // Determine the appropriate styling based on plan
  const getBadgeClasses = (plan: PlanType) => {
    const baseClasses = "px-3 py-1.5 rounded-full text-sm inline-block min-w-[80px] text-center";
    
    // Convert to lowercase for case-insensitive comparison
    const normalizedPlan = plan.toLowerCase();
    
    switch(normalizedPlan) {
      case 'premium':
        return classNames(baseClasses, "bg-purple-300 text-purple-700", className);
      case 'basic':
        return classNames(baseClasses, "bg-blue-200 text-blue-700", className);
      default:
        return classNames(baseClasses, "bg-blue-200 text-gray-700", className);
    }
  };
  
  // Translate the plan if a translation key exists
  const getTranslatedPlan = (plan: PlanType) => {
    const translationKey = `job.plan.${plan.toLowerCase()}`;
    const translated = t(translationKey, plan);
    return translated;
  };
  
  return (
    <span className={getBadgeClasses(plan)}>
      {getTranslatedPlan(plan)}
    </span>
  );
};

export default PlanBadge;
