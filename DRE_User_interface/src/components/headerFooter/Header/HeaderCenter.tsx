import React from 'react';
import { Link, useRouter } from '@tanstack/react-router';

const HeaderCenter: React.FC = () => {
  const router = useRouter();
  
  // Define navigation links
  const navLinks = [
    { name: 'DRE Home', path: '/' },
    { name: 'Assessment', path: '/assessment' },
    { name: 'Forecast', path: '/forecast' },
    { name: 'Archive', path: '/archive' },
  ];

  return (
    <div className="hidden h-full items-center justify-center md:flex gap-20 w-3/5">
      {navLinks.map((link) => {
        const isActive = router.state.location.pathname === link.path || 
                        (link.path !== '/' && router.state.location.pathname.startsWith(link.path));
        
        return (
          <Link
            key={link.name}
            to={link.path}
            className={`text-lg font-medium transition-colors duration-250 ${
              isActive 
                ? 'text-blue-500' 
                : 'text-white hover:text-[#7A7A7A]'
            }`}
          >
            {link.name}
          </Link>
        );
      })}
    </div>
  );
};

export default HeaderCenter;
