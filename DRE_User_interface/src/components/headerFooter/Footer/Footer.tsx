import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

// Import footer logos
import footerLogo1 from '../logos/fotter_1.png';
import footerLogo2 from '../logos/fotter_2.png';
import footerLogo3 from '../logos/fotter_3.png';
import footerLogo4 from '../logos/fotter_4.png';
import footerLogo5 from '../logos/fotter_5.png';
import footerLogo6 from '../logos/fotter_6.png';

const Footer: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <footer className="fixed bottom-0 w-full flex items-center justify-center h-16 bg-[#0D1527] text-white border-t-2 border-[#7B34DB] z-50">
      <div className="flex w-full max-w-[1600px] h-full items-center justify-between px-5">
        {/* Left container */}
        <div className="flex items-center justify-center">
          {/* <a href="/" className="block">
            <img 
              src={despLogo} 
              alt="HYREF Logo" 
              className="h-9 w-auto"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const span = document.createElement('span');
                  span.className = 'text-xl font-bold text-white';
                  span.textContent = 'HYREF';
                  parent.appendChild(span);
                }
              }}
            />
          </a> */}
        </div>
        
        {/* Central container - partner logos */}
        <div className="hidden md:flex items-center justify-center space-x-4">
          {[footerLogo1, footerLogo2, footerLogo3, footerLogo4, footerLogo5, footerLogo6].map((logo, index) => (
            <a key={index} href="#" className="block">
              <img 
                src={logo} 
                alt={`Partner logo ${index + 1}`} 
                className="h-10 w-auto"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.style.display = 'none';
                }}
              />
            </a>
          ))}
        </div>
        
        {/* Right container - menu icon */}
        <div className="flex items-center justify-center relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white hover:text-[#7A7A7A] transition-colors duration-250"
          >
            <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
          </button>
          
          {/* Footer menu */}
          {menuOpen && (
            <div 
              ref={menuRef}
              className="absolute right-0 bottom-16 w-60 bg-[#0D1527BB] flex flex-col"
            >
              <a href="#" className="p-4 text-white hover:bg-[#1E2637] transition-colors duration-250">
                Code of Conduct
              </a>
              <a href="#" className="p-4 text-white hover:bg-[#1E2637] transition-colors duration-250">
                Terms and Conditions
              </a>
              <a href="#" className="p-4 text-white hover:bg-[#1E2637] transition-colors duration-250">
                Privacy Policies
              </a>
              <a href="#" className="p-4 text-white hover:bg-[#1E2637] transition-colors duration-250">
                Legal Notice
              </a>
              
              {/* Mobile partner logos */}
              <div className="md:hidden border-t border-[#3C3C3C] p-4">
                <div className="grid grid-cols-2 gap-4">
                  {[footerLogo1, footerLogo2, footerLogo3, footerLogo4, footerLogo5, footerLogo6].map((logo, index) => (
                    <a key={index} href="#" className="block">
                      <img 
                        src={logo} 
                        alt={`Partner logo ${index + 1}`} 
                        className="h-8 w-auto"
                        onError={(e) => {
                          // Fallback if image doesn't exist
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </a>
                  ))}
                </div>
              </div>
              <p className="p-4 text-white text-sm">
                &copy; {new Date().getFullYear()} HYREF
              </p>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
