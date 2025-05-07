import React from 'react';
import { cn } from '../../utils/cn';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  className, 
  size = 'md', 
  ...props 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent text-blue-600',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
