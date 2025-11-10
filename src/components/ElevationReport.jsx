import React from 'react';
import { TrendingUp, TrendingDown, Mountain, Activity, ArrowUp, ArrowDown } from 'lucide-react';

const ElevationReport = ({ routeData, elevationProfile }) => {
  if (!routeData || !elevationProfile || elevationProfile.length === 0) {
    return (
      <div className="card h-full flex items-center justify-center min-h-[300px]">
        <div className="text-center text-gray-500">
          <Mountain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Select a route to view elevation analysis</p>
        </div>
      </div>
    );
  }

  const maxElevation = Math.max(...elevationProfile.map(d => d.elevation));
  const minElevation = Math.min(...elevationProfile.map(d => d.elevation));
  const elevationRange = maxElevation - minElevation;
  const avgGradient = ((routeData.elevationGain / (routeData.distanceKm * 1000)) * 100).toFixed(2);
  const totalAscentTime = (routeData.elevationGain / 10) * 60; // Rough estimate: 10m/min ascent
  const totalDescentTime = (routeData.elevationLoss / 20) * 60; // Rough estimate: 20m/min descent

  return (
    <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
          <Mountain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Elevation Analysis Report</h3>
          <p className="text-sm text-gray-600">Detailed terrain and gradient information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Elevation Gain */}
        <div className="bg-white rounded-xl p-4 border-2 border-red-200 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Total Elevation Gain</span>
          </div>
          <div className="text-3xl font-bold text-red-600">
            {routeData.elevationGain.toFixed(1)} m
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Uphill climbing required
          </div>
        </div>

        {/* Elevation Loss */}
        <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Total Elevation Loss</span>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {routeData.elevationLoss.toFixed(1)} m
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Downhill descent
          </div>
        </div>

        {/* Elevation Range */}
        <div className="bg-white rounded-xl p-4 border-2 border-purple-200 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Elevation Range</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {elevationRange.toFixed(1)} m
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Total variation
          </div>
        </div>

        {/* Average Gradient */}
        <div className="bg-white rounded-xl p-4 border-2 border-amber-200 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Mountain className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Average Gradient</span>
          </div>
          <div className="text-3xl font-bold text-amber-600">
            {avgGradient}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Overall slope
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Elevation Statistics */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-md">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ArrowUp className="w-5 h-5 text-blue-600" />
            Elevation Statistics
          </h4>
          <div className="space-y-3">
            <MetricRow label="Maximum Elevation" value={`${maxElevation.toFixed(1)} m`} />
            <MetricRow label="Minimum Elevation" value={`${minElevation.toFixed(1)} m`} />
            <MetricRow label="Starting Elevation" value={`${elevationProfile[0].elevation.toFixed(1)} m`} />
            <MetricRow label="Ending Elevation" value={`${elevationProfile[elevationProfile.length - 1].elevation.toFixed(1)} m`} />
            <MetricRow 
              label="Net Elevation Change" 
              value={`${(elevationProfile[elevationProfile.length - 1].elevation - elevationProfile[0].elevation).toFixed(1)} m`}
              highlight={(elevationProfile[elevationProfile.length - 1].elevation - elevationProfile[0].elevation) > 0}
            />
          </div>
        </div>

        {/* Gradient Analysis */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-md">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Gradient Analysis
          </h4>
          <div className="space-y-3">
            <MetricRow label="Average Uphill Gradient" value={`${avgGradient}%`} />
            <MetricRow label="Estimated Climb Time" value={`${Math.round(totalAscentTime)} seconds`} />
            <MetricRow label="Estimated Descent Time" value={`${Math.round(totalDescentTime)} seconds`} />
            <MetricRow 
              label="Difficulty Rating" 
              value={getDifficultyRating(parseFloat(avgGradient))}
              isText
            />
            <MetricRow 
              label="Terrain Type" 
              value={getTerrainType(elevationRange)}
              isText
            />
          </div>
        </div>
      </div>

      {/* Energy Impact */}
      <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200">
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ArrowDown className="w-5 h-5 text-amber-600" />
          Energy Impact Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-amber-200">
            <div className="text-xs text-gray-600 mb-1">Uphill Energy Required</div>
            <div className="text-xl font-bold text-red-600">
              {routeData.uphillEnergy.toFixed(3)} kWh
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Due to {routeData.elevationGain.toFixed(1)}m climb
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="text-xs text-gray-600 mb-1">Downhill Energy Recovered</div>
            <div className="text-xl font-bold text-green-600">
              {routeData.regeneratedEnergy.toFixed(3)} kWh
            </div>
            <div className="text-xs text-gray-500 mt-1">
              From {routeData.elevationLoss.toFixed(1)}m descent
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="text-xs text-gray-600 mb-1">Net Elevation Impact</div>
            <div className="text-xl font-bold text-blue-600">
              {(routeData.uphillEnergy - routeData.regeneratedEnergy).toFixed(3)} kWh
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Total energy cost
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-6 bg-blue-100 rounded-xl p-5 border-2 border-blue-300">
        <h4 className="font-bold text-gray-800 mb-3">Driving Recommendations</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          {routeData.elevationGain > 15 && (
            <li className="flex items-start gap-2">
              <span className="text-red-600 font-bold">•</span>
              <span>Significant uphill climb detected. Expect increased energy consumption.</span>
            </li>
          )}
          {routeData.elevationLoss > 15 && (
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Downhill sections available. Regenerative braking will recover energy.</span>
            </li>
          )}
          {parseFloat(avgGradient) > 5 && (
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span>Steep gradient detected. Drive in economy mode for better efficiency.</span>
            </li>
          )}
          {parseFloat(avgGradient) < 2 && (
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Relatively flat route. Optimal for energy efficiency.</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

const MetricRow = ({ label, value, highlight, isText }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-600 font-medium">{label}</span>
    <span className={`text-sm font-bold ${
      highlight ? 'text-green-600' : isText ? 'text-gray-800' : 'text-gray-700'
    }`}>
      {value}
    </span>
  </div>
);

const getDifficultyRating = (gradient) => {
  if (gradient < 2) return 'Easy - Minimal climbing';
  if (gradient < 4) return 'Moderate - Some hills';
  if (gradient < 6) return 'Challenging - Significant hills';
  if (gradient < 8) return 'Difficult - Steep climbs';
  return 'Very Difficult - Very steep';
};

const getTerrainType = (range) => {
  if (range < 10) return 'Flat terrain';
  if (range < 20) return 'Rolling hills';
  if (range < 30) return 'Hilly terrain';
  return 'Mountainous terrain';
};

export default ElevationReport;

