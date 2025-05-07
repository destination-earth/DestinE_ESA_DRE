import React from 'react';
import { Link } from '@tanstack/react-router';

const FooterLeft: React.FC = () => {
  return (
    <div className="flex flex-col items-start">
      <Link to="/" className="mb-2">
        <img 
          src="/logo-full.png" 
          alt="HYREF Logo" 
          className="h-10 w-auto"
          onError={(e) => {
            // Fallback if image doesn't exist
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const span = document.createElement('span');
              span.className = 'text-xl font-bold text-gray-800';
              span.textContent = 'HYREF';
              parent.appendChild(span);
            }
          }}
        />
      </Link>
      <p className="text-sm text-gray-600 max-w-xs">
        Hybrid Renewable Energy Forecasting System - Advanced forecasting for solar and wind energy production
      </p>
    </div>
  );
};

export default FooterLeft;
