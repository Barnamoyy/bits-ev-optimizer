import React, { useState } from 'react';
import { MapPin, TrendingUp, Target, Plus, Trash2, Save, Zap } from 'lucide-react';

const OptimalLocationFinder = ({ 
  locations, 
  chargingStation, 
  onFindOptimal,
  optimalLocations,
  onClearOptimal 
}) => {
  const [routes, setRoutes] = useState([]);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [numStations, setNumStations] = useState(1);

  const [newRoute, setNewRoute] = useState({
    startId: '',
    endId: '',
    frequency: 5,
    name: ''
  });

  const allLocations = [chargingStation, ...locations];

  const handleAddRoute = () => {
    if (newRoute.startId && newRoute.endId && newRoute.startId !== newRoute.endId) {
      const start = allLocations.find(loc => loc.id === newRoute.startId);
      const end = allLocations.find(loc => loc.id === newRoute.endId);

      const route = {
        id: `route-${Date.now()}`,
        start: start,
        end: end,
        frequency: parseInt(newRoute.frequency) || 1,
        name: newRoute.name || `${start.name} to ${end.name}`
      };

      setRoutes([...routes, route]);
      setNewRoute({ startId: '', endId: '', frequency: 5, name: '' });
      setShowAddRoute(false);
    }
  };

  const handleRemoveRoute = (routeId) => {
    setRoutes(routes.filter(r => r.id !== routeId));
  };

  const handleFindOptimal = () => {
    if (routes.length > 0) {
      onFindOptimal(routes, numStations);
    }
  };

  const totalDailyTrips = routes.reduce((sum, r) => sum + r.frequency, 0);

  return (
    <div className="card bg-white border-2 border-gray-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-black rounded-xl">
          <Target className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Optimal Location Finder</h3>
          <p className="text-xs text-gray-600">Find best charging station placement</p>
        </div>
      </div>

      {/* Current Routes */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700">
            Common Routes ({routes.length})
          </h4>
          {routes.length > 0 && (
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
              {totalDailyTrips} daily trips
            </span>
          )}
        </div>

        {routes.length === 0 ? (
          <div className="text-center py-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No routes added yet</p>
            <p className="text-xs text-gray-500 mt-1">Add common routes to find optimal location</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {routes.map(route => (
              <div key={route.id} className="bg-gray-50 p-3 rounded-lg border border-gray-300 flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{route.name}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {route.frequency} trips/day
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveRoute(route.id)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Route Form */}
      {showAddRoute ? (
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Add New Route</h4>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Start Location</label>
              <select
                value={newRoute.startId}
                onChange={(e) => setNewRoute({ ...newRoute, startId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Select start...</option>
                {allLocations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">End Location</label>
              <select
                value={newRoute.endId}
                onChange={(e) => setNewRoute({ ...newRoute, endId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                disabled={!newRoute.startId}
              >
                <option value="">Select end...</option>
                {allLocations.filter(loc => loc.id !== newRoute.startId).map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">
                Daily Frequency (trips/day)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={newRoute.frequency}
                onChange={(e) => setNewRoute({ ...newRoute, frequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddRoute}
                disabled={!newRoute.startId || !newRoute.endId}
                className="flex-1 bg-black hover:bg-gray-800 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 inline mr-1" />
                Add Route
              </button>
              <button
                onClick={() => setShowAddRoute(false)}
                className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddRoute(true)}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors mb-4"
        >
          <Plus className="w-5 h-5" />
          Add Route
        </button>
      )}

      {/* Number of Stations */}
      {routes.length > 0 && (
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Number of Charging Stations
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="5"
              value={numStations}
              onChange={(e) => setNumStations(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg font-bold text-black min-w-[2rem] text-center">
              {numStations}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Find optimal placement for {numStations} charging station{numStations > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Find Optimal Button */}
      <button
        onClick={handleFindOptimal}
        disabled={routes.length === 0}
        className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
      >
        <Zap className="w-5 h-5" />
        Find Optimal Location{numStations > 1 ? 's' : ''}
      </button>

      {/* Clear Results */}
      {optimalLocations && optimalLocations.length > 0 && (
        <button
          onClick={onClearOptimal}
          className="w-full mt-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm"
        >
          Clear Results
        </button>
      )}

      {/* Results Summary */}
      {optimalLocations && optimalLocations.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 border-2 border-gray-300 rounded-lg">
          <h4 className="text-sm font-bold text-black mb-2">
            Optimal Location{optimalLocations.length > 1 ? 's' : ''} Found!
          </h4>
            {optimalLocations.map((loc, index) => (
              <div key={index} className="text-xs text-gray-800 mb-3 pb-2 border-b border-gray-300 last:border-0">
                <div className="font-semibold mb-1">Station {index + 1}:</div>
                {loc.snapped && (
                  <div className="text-gray-600 font-medium mb-1">
                    On {loc.roadName}
                  </div>
                )}
                <div>Avg Distance: {loc.metrics.averageDistance.toFixed(0)}m</div>
                <div>Coverage: {loc.metrics.coveragePercentage.toFixed(0)}%</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default OptimalLocationFinder;
