import React, { useState } from 'react';

const PricingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assessment' | 'forecast'>('assessment');

  const Checkmark = () => <span className="text-green-500">✓</span>;

  return (
    <div className="min-h-screen bg-[#0D1527] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex mb-8 border-b border-gray-700">
          <button
            className={`px-6 py-3 text-lg font-semibold focus:outline-none ${
              activeTab === 'assessment'
                ? 'border-b-2 border-[#3fa3ca] text-[#3fa3ca]'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('assessment')}
          >
            Assessment
          </button>
          <button
            className={`px-6 py-3 text-lg font-semibold focus:outline-none ${
              activeTab === 'forecast'
                ? 'border-b-2 border-[#3fa3ca] text-[#3fa3ca]'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('forecast')}
          >
            Forecast
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'assessment' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Assessment Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Feature List */}
                <div className="col-span-1 mt-16 space-y-4 text-right pr-4">
                  <p>Compare plans</p>
                  <p>Calculate GHI, DNI monthly means</p>
                  <p>Download data</p>
                  <p>Estimate Power Production</p>
                  <p>Email Support</p>
                  <p>24/7 customer support</p>
                </div>

                {/* Basic Plan */}
                <div className="col-span-1 text-center">
                  <h3 className="text-xl font-semibold mb-4">Basic</h3>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded mb-6">
                    Choose This Plan
                  </button>
                  <div className="space-y-4">
                    <p>&nbsp;</p> {/* Placeholder for alignment */}
                    <p><Checkmark /></p>
                    <p><Checkmark /></p>
                    <p>-</p> {/* No mark */}
                    <p><Checkmark /></p>
                    <p>-</p> {/* No mark */}
                  </div>
                </div>

                {/* Premium Plan */}
                <div className="col-span-1 text-center">
                  <h3 className="text-xl font-semibold mb-4">Premium</h3>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded mb-6">
                    Choose This Plan
                  </button>
                   <div className="space-y-4">
                    <p>&nbsp;</p> {/* Placeholder for alignment */}
                    <p><Checkmark /></p>
                    <p><Checkmark /></p>
                    <p><Checkmark /></p>
                    <p><Checkmark /></p>
                    <p><Checkmark /></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'forecast' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Forecast Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                 {/* Feature List */}
                <div className="col-span-1 mt-16 space-y-4 text-right pr-4">
                  <p>Compare plans</p>
                  <p>2-day Energy Forecast</p>
                  <p>2-day Power Production Forecast</p>
                  <p>Email Support</p>
                  <p>24/7 customer support</p>
                  <p>Forecasts archive</p>
                </div>

                {/* Free Plan */}
                <div className="col-span-1 text-center">
                  <h3 className="text-xl font-semibold mb-4">Free</h3>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded mb-6">
                    Choose This Plan
                  </button>
                   <div className="space-y-4">
                    <p>&nbsp;</p> {/* Placeholder for alignment */}
                    <p><Checkmark /></p>
                    <p>-</p>
                    <p><Checkmark /></p>
                    <p>-</p>
                    <p>-</p>
                  </div>
                </div>

                {/* One-Off Plan */}
                <div className="col-span-1 text-center">
                  <h3 className="text-xl font-semibold mb-4">One-Off</h3>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded mb-6">
                    Choose This Plan
                  </button>
                   <div className="space-y-4">
                    <p>&nbsp;</p> {/* Placeholder for alignment */}
                    <p><Checkmark /></p>
                    <p><Checkmark /></p>
                    <p><Checkmark /></p>
                    <p><Checkmark /></p>
                    <p><Checkmark /></p>
                  </div>
                </div>

                 {/* Annual Plan */}
                <div className="col-span-1 text-center">
                  <h3 className="text-xl font-semibold mb-4">Annual subscription</h3>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded mb-6">
                    Choose This Plan
                  </button>
                   <div className="space-y-4">
                    <p>&nbsp;</p> {/* Placeholder for alignment */}
                    <p><Checkmark /></p>
                    <p><Checkmark /></p>
                    <p><Checkmark /></p>
                    <p><Checkmark /></p>
                    <p><Checkmark /></p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
