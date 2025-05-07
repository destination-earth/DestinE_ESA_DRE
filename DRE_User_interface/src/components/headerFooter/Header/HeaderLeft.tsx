import React from 'react';
import { Link } from '@tanstack/react-router';
// Keeping these imports commented for future reference
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faBars } from '@fortawesome/free-solid-svg-icons';
// Import the logo images directly
import destEarthLogo from '../logos/destination_earth_logo.svg';
import dreLogo from '../logos/b2.png';

// For the logo fallbacks
const LOGO_TEXT = {
  main: 'HYREF',
  service: 'Service'
};

// Keeping the interface for future reference
// interface HeaderLeftProps {
//   onMenuToggle: () => void;
// }

// Using empty interface for now
interface HeaderLeftProps {}

const HeaderLeft: React.FC<HeaderLeftProps> = () => {
  return (
    <div className="flex h-full items-center gap-2 w-1/5 pr-2">
      {/* Menu toggle button - commented out for future reference
      <button 
        className="flex aspect-square w-10 items-center justify-center ml-0" 
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <FontAwesomeIcon icon={faBars} className="text-gray-600" />
      </button> */}
      
      {/* First logo */}
      <Link to="https://platform.destine.eu" className="flex items-center" target="_blank" rel="noopener noreferrer">
        <img 
          src={destEarthLogo} 
          alt="HYREF Logo" 
          className="h-8 w-auto object-contain"
          onError={(e) => {
            // Fallback if image doesn't exist
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const span = document.createElement('span');
              span.className = 'text-xl font-bold text-white';
              span.textContent = LOGO_TEXT.main;
              parent.appendChild(span);
            }
          }}
        />
      </Link>
      
      {/* Second logo */}
      <Link to="https://destination-earth.eu/use-cases/destination-renewable-energy-dre/" className="flex items-center" target="_blank" rel="noopener noreferrer">
        <img 
          src={dreLogo} 
          alt="Service Logo" 
          className="h-32 w-32 py-2 "
          onError={(e) => {
            // Fallback if image doesn't exist
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const span = document.createElement('span');
              span.className = 'text-lg font-bold text-white';
              span.textContent = LOGO_TEXT.service;
              parent.appendChild(span);
            }
          }}
        />
      </Link>
    </div>
  );
};

export default HeaderLeft;
