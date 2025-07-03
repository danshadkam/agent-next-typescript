"use client";

import { useState } from "react";

interface MarketData {
  symbol: string;
  price: number;
  changePercent: number;
}

// SUPER SIMPLE TEST CHART
const SimpleChart = ({ symbol, data }: { symbol: string, data?: MarketData | null }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1D');

  const handlePeriodClick = (period: string) => {
    console.log(`🎯 SIMPLE CHART CLICKED: ${period} for ${symbol}`);
    setSelectedPeriod(period);
    alert(`✅ WORKING! Period changed to ${period} for ${symbol}`);
  };

  return (
    <div className="w-full h-full flex flex-col bg-red-500 border-4 border-yellow-300 p-4">
      {/* OBVIOUS TEST HEADER */}
      <div className="bg-green-400 text-black p-3 text-center font-bold text-xl mb-4">
        🚀 SIMPLE REACTIVE CHART FOR {symbol} ✅
      </div>
      
      {/* Price Display */}
      <div className="bg-blue-400 text-white p-3 text-center mb-4">
        <div className="text-2xl font-bold">${data?.price?.toFixed(2) || '199.99'}</div>
        <div className="text-sm">Current Period: {selectedPeriod}</div>
      </div>

      {/* Fake Chart Area */}
      <div className="flex-1 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
        <div className="text-white text-2xl font-bold">
          CHART FOR {selectedPeriod} PERIOD
        </div>
      </div>

      {/* Functional Buttons */}
      <div className="bg-purple-400 p-3 rounded">
        <div className="text-center mb-2 font-bold">Time Period Buttons (CLICK TO TEST):</div>
        <div className="flex space-x-2 justify-center">
          {['1D', '1W', '1M', '1Y'].map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodClick(period)}
              className={`px-4 py-2 rounded font-bold text-lg ${
                selectedPeriod === period 
                  ? 'bg-green-500 text-white scale-110' 
                  : 'bg-yellow-300 text-black hover:bg-yellow-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
        <div className="text-center mt-2 text-sm">
          These buttons should show alerts when clicked!
        </div>
      </div>
    </div>
  );
};

export default SimpleChart; 