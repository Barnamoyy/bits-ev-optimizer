import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Mountain } from 'lucide-react';

const ElevationProfile = ({ elevationData, routeInfo }) => {
  if (!elevationData || elevationData.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500 text-sm">No elevation data available</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border-2 border-gray-300 rounded-xl shadow-xl">
          <p className="text-sm font-bold text-gray-800 mb-1">
            Distance: {payload[0].payload.distance.toFixed(2)} km
          </p>
          <p className="text-sm text-gray-600">
            Elevation: {payload[0].value.toFixed(1)} meters
          </p>
        </div>
      );
    }
    return null;
  };

  const maxElevation = Math.max(...elevationData.map(d => d.elevation));
  const minElevation = Math.min(...elevationData.map(d => d.elevation));
  const elevationRange = maxElevation - minElevation;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <div className="p-2 bg-black rounded-lg">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          Elevation Profile
        </h3>
        <div className="flex gap-5 text-sm">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-300">
            <TrendingUp className="w-5 h-5 text-black" />
            <span className="text-gray-700">
              Gain: <span className="font-bold text-black">{routeInfo?.elevationGain?.toFixed(0)}m</span>
            </span>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-300">
            <TrendingDown className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">
              Loss: <span className="font-bold text-gray-700">{routeInfo?.elevationLoss?.toFixed(0)}m</span>
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={elevationData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#000000" stopOpacity={0.3} />
                <stop offset="50%" stopColor="#555555" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#999999" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" opacity={0.5} />
            <XAxis 
              dataKey="distance" 
              label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5, style: { fontWeight: 'bold', fill: '#374151' } }}
              tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }}
              stroke="#9ca3af"
            />
            <YAxis 
              label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft', style: { fontWeight: 'bold', fill: '#374151' } }}
              tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }}
              domain={[Math.floor(minElevation - 5), Math.ceil(maxElevation + 5)]}
              stroke="#9ca3af"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="elevation" 
              stroke="#000000" 
              strokeWidth={3}
              fill="url(#elevationGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatCard 
          label="Max Elevation"
          value={`${maxElevation.toFixed(0)}m`}
        />
        <StatCard 
          label="Min Elevation"
          value={`${minElevation.toFixed(0)}m`}
        />
        <StatCard 
          label="Range"
          value={`${elevationRange.toFixed(0)}m`}
        />
        <StatCard 
          label="Avg Gradient"
          value={`${((routeInfo?.elevationGain / (routeInfo?.distanceKm * 1000)) * 100).toFixed(1)}%`}
        />
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-white border-2 border-gray-300 p-4 rounded-xl shadow-md text-center transform hover:scale-105 transition-transform">
    <div className="text-xs text-gray-600 font-medium mb-2">{label}</div>
    <div className="text-2xl font-bold text-black">{value}</div>
  </div>
);

export default ElevationProfile;
