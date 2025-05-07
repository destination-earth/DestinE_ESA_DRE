import React from 'react';

const FooterCenter: React.FC = () => {
  // Partner logos - replace with actual partner logos
  const partners = [
    { id: 1, name: 'Partner 1', logo: '/partner1.png' },
    { id: 2, name: 'Partner 2', logo: '/partner2.png' },
    { id: 3, name: 'Partner 3', logo: '/partner3.png' },
    { id: 4, name: 'Partner 4', logo: '/partner4.png' },
  ];

  return (
    <div className="flex flex-col items-center">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Our Partners</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {partners.map((partner) => (
          <div key={partner.id} className="flex items-center justify-center">
            <div className="h-12 w-24 rounded bg-gray-100 p-2 flex items-center justify-center">
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-full max-w-full"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const span = document.createElement('span');
                    span.className = 'text-xs text-gray-500';
                    span.textContent = partner.name;
                    parent.appendChild(span);
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FooterCenter;
