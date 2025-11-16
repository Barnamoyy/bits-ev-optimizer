import React, { useState, useEffect } from 'react';
import MapView from './components/MapView';
import Dashboard from './components/Dashboard';
import RouteSelector from './components/RouteSelector';
import ElevationProfile from './components/ElevationProfile';
import ElevationReport from './components/ElevationReport';
import OptimalLocationFinder from './components/OptimalLocationFinder';
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
import { findOptimalChargingLocation, findMultipleOptimalLocations } from './utils/chargingStationOptimizer';

function App() {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [elevationProfile, setElevationProfile] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(80);
  const [loading, setLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [optimalLocations, setOptimalLocations] = useState([]);

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

  const handleFindOptimalLocation = async (routes, numStations) => {
    setLoading(true);
    setRouteError(null);
    try {
      if (numStations === 1) {
        const optimal = await findOptimalChargingLocation(routes, [CHARGING_STATION]);
        setOptimalLocations([optimal]);
      } else {
        const optimals = await findMultipleOptimalLocations(routes, numStations);
        setOptimalLocations(optimals);
      }
    } catch (error) {
      console.error('Error finding optimal location:', error);
      setRouteError('Failed to find optimal location');
    } finally {
      setLoading(false);
    }
  };

  const handleClearOptimal = () => {
    setOptimalLocations([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white backdrop-blur-md shadow-lg border-b border-gray-300 sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <Zap className="w-8 h-8 text-white" fill="white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">
                  EV Charging Optimizer
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">BITS Goa Campus - Smart Energy Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Battery Level Control */}
              <div className="flex items-center gap-3 bg-gray-100 px-6 py-3 rounded-xl border border-gray-300 shadow-md">
                <Battery className="w-6 h-6 text-black" />
                <div className="flex flex-col">
                  <div className="text-xs font-medium text-gray-600 mb-1">Current Battery</div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={batteryLevel}
                      onChange={(e) => setBatteryLevel(Number(e.target.value))}
                      className="w-32 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-black"
                      style={{
                        background: `linear-gradient(to right, #000000 0%, #000000 ${batteryLevel}%, #e5e5e5 ${batteryLevel}%, #e5e5e5 100%)`
                      }}
                    />
                    <div className="text-lg font-bold text-black min-w-[3rem] text-right">
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
          <div className="xl:col-span-1 space-y-6 xl:sticky xl:top-32 xl:self-start xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto xl:pr-4">
            <RouteSelector
              locations={CAMPUS_LOCATIONS}
              chargingStation={CHARGING_STATION}
              onRouteSelect={handleRouteSelect}
              selectedRoute={selectedRoute}
              loading={loading}
            />
            
            {/* Loading/Error Messages */}
            {loading && (
              <div className="card bg-gray-100 border-2 border-gray-300">
                <div className="flex items-center gap-3">
                  <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"></div>
                  <div>
                    <p className="font-semibold text-black">Calculating Route...</p>
                    <p className="text-sm text-gray-700">Fetching road path and elevation data</p>
                  </div>
                </div>
              </div>
            )}
            
            {routeError && (
              <div className="card bg-gray-200 border-2 border-gray-400">
                <p className="text-sm text-gray-900">{routeError}</p>
              </div>
            )}
            
            {routeData && !loading && (
              <div className="card bg-gray-100 border-2 border-gray-300">
                <p className="text-sm font-semibold text-black">
                  Route Type: {routeData.routeType === 'road' ? 'Actual Road Path' : 'Straight Line'}
                </p>
                {routeData.routeType === 'road' && (
                  <p className="text-xs text-gray-700 mt-1">
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

            {/* Optimal Location Finder */}
            <OptimalLocationFinder
              locations={CAMPUS_LOCATIONS}
              chargingStation={CHARGING_STATION}
              onFindOptimal={handleFindOptimalLocation}
              optimalLocations={optimalLocations}
              onClearOptimal={handleClearOptimal}
            />
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
                optimalLocations={optimalLocations}
              />
            </div>

            {/* Show welcome message if no route selected */}
            {!selectedRoute && !loading && (
              <div className="card bg-gray-100 border-2 border-gray-300 p-12 text-center">
                <div className="max-w-2xl mx-auto">
                  <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-black mb-4">
                    Welcome to EV Charging Optimizer
                  </h2>
                  <p className="text-lg text-gray-700 mb-6">
                    Calculate optimal charging intervals based on actual road routes, real elevation data, and vehicle energy requirements
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mt-8">
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                        <MapPin className="w-6 h-6 text-black" />
                      </div>
                      <h3 className="font-semibold text-black mb-1">Step 1</h3>
                      <p className="text-sm text-gray-600">Select start and end locations from the left panel</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                        <Zap className="w-6 h-6 text-black" />
                      </div>
                      <h3 className="font-semibold text-black mb-1">Step 2</h3>
                      <p className="text-sm text-gray-600">Click calculate to fetch real road data and elevation</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                        <Activity className="w-6 h-6 text-black" />
                      </div>
                      <h3 className="font-semibold text-black mb-1">Step 3</h3>
                      <p className="text-sm text-gray-600">View energy analysis, elevation profile, and charging recommendations</p>
                    </div>
                  </div>
                  <div className="mt-8 p-4 bg-white rounded-lg border-2 border-gray-300">
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
      <footer className="mt-16 py-8 bg-black border-t border-gray-700">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-8 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} EV Charging Optimizer. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
