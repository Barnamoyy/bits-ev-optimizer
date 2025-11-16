import React, { useState } from 'react';
import { MapPin, ArrowRight, Route, Sparkles } from 'lucide-react';

const RouteSelector = ({ locations, chargingStation, onRouteSelect, selectedRoute, loading }) => {
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');

  const allLocations = [
    chargingStation,
    ...locations
  ];

  const handleCalculate = () => {
    if (startLocation && endLocation && startLocation !== endLocation) {
      const start = allLocations.find(loc => loc.id === startLocation);
      const end = allLocations.find(loc => loc.id === endLocation);
      
      if (start && end) {
        onRouteSelect({
          start,
          end,
          id: `${start.id}-to-${end.id}`
        });
      }
    }
  };

  return (
    <div className="card bg-white border-2 border-gray-300 shadow-xl">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-black rounded-lg">
          <Route className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Route Planner</h3>
      </div>
      
      <div className="space-y-5">
        {/* Start Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              Start Location
            </div>
          </label>
          <select
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-700 font-medium shadow-sm hover:border-gray-500 transition-colors"
          >
            <option value="">Select start location...</option>
            {allLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} • {loc.elevation}m
              </option>
            ))}
          </select>
        </div>

        {/* Arrow Indicator */}
        <div className="flex justify-center">
          <div className="p-3 bg-gray-600 rounded-full">
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* End Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              End Location
            </div>
          </label>
          <select
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-gray-700 font-medium shadow-sm hover:border-gray-500 transition-colors"
          >
            <option value="">Select end location...</option>
            {allLocations.map((loc) => (
              <option 
                key={loc.id} 
                value={loc.id}
                disabled={loc.id === startLocation}
              >
                {loc.name} • {loc.elevation}m
              </option>
            ))}
          </select>
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          disabled={!startLocation || !endLocation || startLocation === endLocation || loading}
          className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              Calculating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Calculate Route Energy
            </>
          )}
        </button>

        {/* Route Info */}
        {selectedRoute && (
          <div className="mt-4 p-4 bg-gray-100 border-2 border-gray-300 rounded-xl shadow-md">
            <div className="text-sm">
              <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                Selected Route
              </div>
              <div className="flex items-center text-gray-700 font-medium">
                <span className="bg-black text-white px-2 py-1 rounded-md text-xs">
                  {selectedRoute.start.name}
                </span>
                <ArrowRight className="w-4 h-4 mx-2 text-gray-500" />
                <span className="bg-gray-700 text-white px-2 py-1 rounded-md text-xs">
                  {selectedRoute.end.name}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Routes */}
      <div className="mt-6 pt-5 border-t-2 border-gray-200">
        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          Quick Routes
        </h4>
        <div className="space-y-2">
          <QuickRouteButton
            label="Main Gate to Charging Station"
            onClick={() => {
              setStartLocation('main-gate');
              setEndLocation('cs-001');
              setTimeout(() => {
                const start = allLocations.find(loc => loc.id === 'main-gate');
                const end = allLocations.find(loc => loc.id === 'cs-001');
                if (start && end) {
                  onRouteSelect({ start, end, id: 'main-gate-to-cs-001' });
                }
              }, 100);
            }}
          />
          <QuickRouteButton
            label="Academic Block to Cafeteria"
            onClick={() => {
              setStartLocation('academic-block');
              setEndLocation('cafeteria');
              setTimeout(() => {
                const start = allLocations.find(loc => loc.id === 'academic-block');
                const end = allLocations.find(loc => loc.id === 'cafeteria');
                if (start && end) {
                  onRouteSelect({ start, end, id: 'academic-block-to-cafeteria' });
                }
              }, 100);
            }}
          />
          <QuickRouteButton
            label="Hostel to Sports Complex"
            onClick={() => {
              setStartLocation('hostels');
              setEndLocation('sports-complex');
              setTimeout(() => {
                const start = allLocations.find(loc => loc.id === 'hostels');
                const end = allLocations.find(loc => loc.id === 'sports-complex');
                if (start && end) {
                  onRouteSelect({ start, end, id: 'hostels-to-sports-complex' });
                }
              }, 100);
            }}
          />
        </div>
      </div>
    </div>
  );
};

const QuickRouteButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left px-4 py-3 text-sm font-medium bg-white hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-400 rounded-lg transition-all shadow-sm hover:shadow-md transform hover:scale-[1.02] flex items-center gap-3"
  >
    <span className="flex-1">{label}</span>
    <ArrowRight className="w-4 h-4 text-gray-400" />
  </button>
);

export default RouteSelector;
