import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faInfo,
  faUser,
  faBars
} from '@fortawesome/free-solid-svg-icons';
import { useRouter } from '@tanstack/react-router';
import { useAuth } from '../../../hooks/useAuth';
import { useUserSettings } from '../../../hooks/query/useUserSettings';

interface HeaderRightProps {}

const HeaderRight: React.FC<HeaderRightProps> = () => {
  const { logout } = useAuth();
  const router = useRouter();
  const [infoDropdownOpen, setInfoDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Fetch user settings using the new hook
  const { data: userSettings, isLoading, isError } = useUserSettings();

  // Handle clicks outside of dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setInfoDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogoutClick = () => {
    setUserDropdownOpen(false);
    logout();
  };

  return (
    <div className="flex items-center justify-end gap-5 w-1/5 h-full">
      {/* Info Button with Dropdown */}
      <div className="relative flex items-center h-full" ref={infoRef}>
        <button
          className="flex items-center justify-center h-full text-white hover:text-[#7A7A7A] transition-colors duration-250"
          onClick={() => setInfoDropdownOpen(!infoDropdownOpen)}
          aria-label="Information"
        >
          <FontAwesomeIcon icon={faInfo} className="h-6 w-6" />
        </button>
        
        {infoDropdownOpen && (
          <div className="absolute right-0 top-16 w-40 bg-[#0D1527BB] flex flex-col z-20">
            <a 
              href="http://localhost:5000/documentation" 
              className="block px-4 py-2 text-white hover:bg-[#1A1D2E] hover:text-[#7A7A7A] transition-colors duration-250"
            >
              Docs
            </a>
            <a 
              onClick={() => {
                setInfoDropdownOpen(false); 
                router.navigate({ to: '/faq' }); 
              }}
              className="block px-4 py-2 text-white hover:bg-[#1A1D2E] hover:text-[#7A7A7A] transition-colors duration-250 cursor-pointer"
            >
              FAQs
            </a>
            <a
              onClick={() => {
                setInfoDropdownOpen(false);
                router.navigate({ to: '/pricing' }); // Use router navigation to /pricing
              }}
              className="block px-4 py-2 text-white hover:bg-[#1A1D2E] hover:text-[#7A7A7A] transition-colors duration-250 cursor-pointer"
            >
              Plans
            </a>
            {/* <a 
              href="http://localhost:5000/pricing" 
              className="block px-4 py-2 text-white hover:bg-[#1A1D2E] hover:text-[#7A7A7A] transition-colors duration-250"
            >
              Plans
            </a> */}
            {/* <a 
              href="#" 
              className="block px-4 py-2 hover:bg-[#1A1D2E]"
            >
              Support
            </a> */}
          </div>
        )}
      </div>

      {/* User Menu */}
      <div className="relative flex items-center h-full" ref={userRef}>
        <button
          className="flex items-center gap-2 px-8 py-2 rounded-full bg-gradient-to-r from-[#EF2B89] to-[#7B34DB] hover:opacity-90 transition-opacity duration-250"
          onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          aria-label="User menu"
          disabled={isLoading} // Optional: disable button while loading
        >
          <FontAwesomeIcon icon={faUser} className="h-6 w-6 text-white" />
          {/* Display username from query, handle loading/error states */}
          <span className="text-sm text-white">
            {isLoading
              ? "Loading..."
              : isError
              ? "Error"
              : userSettings?.userName ?? "User"} {/* Default if name is missing */}
          </span>
        </button>
        
        {userDropdownOpen && (
          <div className="absolute right-0 top-16 w-40 bg-[#0D1527BB] flex flex-col z-10">
            <a 
              href="#" 
              className="block px-4 py-2 text-white hover:bg-[#1A1D2E] hover:text-[#7A7A7A] transition-colors duration-250"
              onClick={() => {
                setUserDropdownOpen(false);
                router.navigate({ to: "/profile" });
              }}
            >
              Account Settings
            </a>
            <a 
              href="#" 
              className="block px-4 py-2 text-white hover:bg-[#1A1D2E] hover:text-[#7A7A7A] transition-colors duration-250"
              onClick={handleLogoutClick}
            >
              Logout
            </a>
          </div>
        )}
      </div>

      {/* Mobile menu icon - only visible on mobile */}
      <div className="md:hidden flex items-center">
        <button className="text-white">
          <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default HeaderRight;
