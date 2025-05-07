import React from 'react';
import ForecastLayout from '../forecast/ForecastLayout';

const ForecastPage = (): React.ReactNode => {

  return (
    <div className="container mx-auto px-4 py-6">
      <ForecastLayout />
    </div>
  );
};

export default ForecastPage;