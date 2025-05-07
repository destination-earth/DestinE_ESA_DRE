import React from 'react';
import { Link } from '@tanstack/react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faPhone, 
  faGlobe, 
  faChevronRight 
} from '@fortawesome/free-solid-svg-icons';

const FooterRight: React.FC = () => {
  // Navigation links
  const navLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
    { name: 'Terms & Conditions', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
  ];

  return (
    <div className="flex flex-col">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Quick Links</h3>
      
      <div className="mb-6 grid grid-cols-1 gap-2">
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            to={link.path} 
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faChevronRight} className="mr-2 text-xs text-blue-500" />
            {link.name}
          </Link>
        ))}
      </div>
      
      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Contact Us</h3>
        <div className="flex flex-col space-y-2">
          <a 
            href="mailto:info@hyref.com" 
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-blue-500" />
            info@hyref.com
          </a>
          <a 
            href="tel:+1234567890" 
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faPhone} className="mr-2 text-blue-500" />
            +1 (234) 567-890
          </a>
          <a 
            href="https://www.hyref.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faGlobe} className="mr-2 text-blue-500" />
            www.hyref.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default FooterRight;
