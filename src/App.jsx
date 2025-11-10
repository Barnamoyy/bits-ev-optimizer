import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import Dashboard from './components/Dashboard';
import RouteSelector from './components/RouteSelector';
import ElevationProfile from './components/ElevationProfile';
import ElevationReport from './components/ElevationReport';
import { Battery, Zap, MapPin, Activity } from 'lucide-react';
import {
  CAMPUS_CENTER,
  CHARGING_STATION,
  CAMPUS_LOCATIONS,
} from './data/campusData';
import {
  calculateDistance,
  calculateEnergyConsumption,
  calculateRemainingBattery,
  calculateChargingTime,
  calculateElevationChanges,
  getEfficiencyRating,
} from './utils/energyCalculator';
import { getRouteFromAPI, simplifyRoute } from './services/routingService';
import { getElevationForRoute, prepareElevationProfile } from './services/elevationService';

function App() {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [elevationProfile, setElevationProfile] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(80);
  const [loading, setLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Handle route selection and calculations with real road data
  const handleRouteSelect = async (route) => {
    setSelectedRoute(route);
    setLoading(true);
    setRouteError(null);

    try {
      // Step 1: Get actual road route from routing API
      const routeResponse = await getRouteFromAPI(
        route.start.lat,
        route.start.lng,
        route.end.lat,
        route.end.lng
      );

      if (!routeResponse.success) {
        setRouteError(routeResponse.error);
      }

      // Step 2: Simplify route to ~50 points for elevation lookup
      const simplifiedCoords = simplifyRoute(routeResponse.coordinates, 50);

      // Step 3: Fetch real elevation data for the route
      const coordsWithElevation = await getElevationForRoute(simplifiedCoords);

      // Step 4: Prepare elevation profile for chart
      const elevProfile = prepareElevationProfile(coordsWithElevation);
      setElevationProfile(elevProfile);

      // Step 5: Set the full route path for map display
      setRoutePath(coordsWithElevation);

      // Step 6: Calculate distance (use API distance if available)
      const distance = routeResponse.distance || calculateDistance(
        route.start.lat,
        route.start.lng,
        route.end.lat,
        route.end.lng
      );

      // Step 7: Calculate elevation changes from real data
      const { gain, loss } = calculateElevationChanges(elevProfile);

      // Step 8: Calculate energy consumption based on actual route
      const energyData = calculateEnergyConsumption(distance, gain, loss);

      // Step 9: Calculate battery after trip
      const batteryAfter = calculateRemainingBattery(batteryLevel, energyData.totalEnergy);

      // Step 10: Get efficiency rating
      const efficiency = getEfficiencyRating(gain, distance);

      // Step 11: Calculate charging if needed
      const minBatteryThreshold = 20;
      let chargingData = { needed: false };

      if (batteryAfter < minBatteryThreshold) {
        const chargingTime = calculateChargingTime(batteryLevel, 80, CHARGING_STATION.power);
        chargingData = {
          needed: true,
          currentBattery: batteryLevel,
          targetBattery: 80,
          time: chargingTime,
          reason: `Battery will drop to ${batteryAfter.toFixed(
            1
          )}% after this trip (below ${minBatteryThreshold}% threshold)`,
        };
      }

      // Step 12: Update route data
      setRouteData({
        distance: distance,
        distanceKm: energyData.distanceKm,
        totalEnergy: energyData.totalEnergy,
        rollingResistance: energyData.rollingResistance,
        airResistance: energyData.airResistance,
        uphillEnergy: energyData.uphillEnergy,
        regeneratedEnergy: energyData.regeneratedEnergy,
        estimatedTime: energyData.estimatedTime,
        elevationGain: gain,
        elevationLoss: loss,
        efficiency: efficiency,
        batteryData: {
          current: batteryLevel,
          afterTrip: batteryAfter,
        },
        chargingData: chargingData,
        routeType: routeResponse.success ? 'road' : 'straight',
      });
    } catch (error) {
      console.error('Error calculating route:', error);
      setRouteError('Failed to calculate route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <Zap className="w-8 h-8 text-white" fill="white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  EV Charging Optimizer
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">BITS Goa Campus - Smart Energy Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Battery Level Control */}
              <div className="flex items-center gap-3 bg-gradient-to-br from-green-50 to-emerald-50 px-6 py-3 rounded-xl border border-green-200 shadow-md">
                <Battery className="w-6 h-6 text-green-600" />
                <div className="flex flex-col">
                  <div className="text-xs font-medium text-gray-600 mb-1">Current Battery</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={batteryLevel}
                      onChange={(e) => setBatteryLevel(Number(e.target.value))}
                      className="w-32 h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${batteryLevel}%, #d1fae5 ${batteryLevel}%, #d1fae5 100%)`
                      }}
                    />
                    <div className="text-lg font-bold text-green-600 min-w-[3rem] text-right">
                      {batteryLevel}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Left Sidebar - Route Selector */}
          <div className="xl:col-span-1 space-y-6 xl:sticky xl:top-32 xl:self-start xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto">
            <RouteSelector
              locations={CAMPUS_LOCATIONS}
              chargingStation={CHARGING_STATION}
              onRouteSelect={handleRouteSelect}
              selectedRoute={selectedRoute}
              loading={loading}
            />
            
            {/* Loading/Error Messages */}
            {loading && (
              <div className="card bg-blue-50 border-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <div>
                    <p className="font-semibold text-blue-900">Calculating Route...</p>
                    <p className="text-sm text-blue-700">Fetching road path and elevation data</p>
                  </div>
                </div>
              </div>
            )}
            
            {routeError && (
              <div className="card bg-yellow-50 border-2 border-yellow-200">
                <p className="text-sm text-yellow-800">{routeError}</p>
              </div>
            )}
            
            {routeData && !loading && (
              <div className="card bg-green-50 border-2 border-green-200">
                <p className="text-sm font-semibold text-green-900">
                  Route Type: {routeData.routeType === 'road' ? 'Actual Road Path' : 'Straight Line'}
                </p>
                {routeData.routeType === 'road' && (
                  <p className="text-xs text-green-700 mt-1">
                    Using real road data and elevation
                  </p>
                )}
              </div>
            )}
            
            {/* Dashboard - only show when route is calculated */}
            {selectedRoute && routeData && (
              <Dashboard
                routeData={routeData}
                batteryData={routeData?.batteryData}
                chargingData={routeData?.chargingData}
              />
            )}
          </div>

          {/* Center - Map and Analysis */}
          <div className="xl:col-span-3 space-y-6 lg:space-y-8">
            {/* Map View */}
            <div className="h-[600px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <MapView
                chargingStation={CHARGING_STATION}
                locations={CAMPUS_LOCATIONS}
                selectedRoute={selectedRoute}
                routePath={routePath}
                center={CAMPUS_CENTER}
              />
            </div>

            {/* Show welcome message if no route selected */}
            {!selectedRoute && !loading && (
              <div className="card bg-gradient-to-br from-blue-50 via-green-50 to-emerald-50 border-2 border-green-200 p-12 text-center">
                <div className="max-w-2xl mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Welcome to EV Charging Optimizer
                  </h2>
                  <p className="text-lg text-gray-700 mb-6">
                    Calculate optimal charging intervals based on actual road routes, real elevation data, and vehicle energy requirements
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mt-8">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                        <MapPin className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">Step 1</h3>
                      <p className="text-sm text-gray-600">Select start and end locations from the left panel</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                        <Zap className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">Step 2</h3>
                      <p className="text-sm text-gray-600">Click calculate to fetch real road data and elevation</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                        <Activity className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1">Step 3</h3>
                      <p className="text-sm text-gray-600">View energy analysis, elevation profile, and charging recommendations</p>
                    </div>
                  </div>
                  <div className="mt-8 p-4 bg-white rounded-lg border-2 border-green-300">
                    <p className="text-sm text-gray-700">
                      <strong>Using Real Data:</strong> Actual GPS coordinates for BITS Goa, real road routing via OSRM, and satellite elevation data from SRTM
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Elevation Report - only show when route is calculated */}
            {selectedRoute && routeData && (
              <ElevationReport 
                routeData={routeData}
                elevationProfile={elevationProfile}
              />
            )}

            {/* Elevation Profile Chart - only show when data is available */}
            {selectedRoute && elevationProfile.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <ElevationProfile
                  elevationData={elevationProfile}
                  routeInfo={routeData}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-700">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-green-400" />
              <p className="text-white font-semibold text-lg">
                EV Charging Optimizer for BITS Goa Campus
              </p>
            </div>
            <p className="text-gray-400 text-sm">
              Built with React, Leaflet & Three.js • Real-time energy consumption analysis
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Optimizes charging intervals based on terrain elevation, distance, and vehicle energy requirements
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
