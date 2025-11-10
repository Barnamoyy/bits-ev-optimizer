import React from 'react';
import { 
  Battery, 
  Zap, 
  TrendingUp, 
  Clock, 
  Navigation, 
  Activity,
  AlertCircle,
  Gauge
} from 'lucide-react';

const Dashboard = ({ routeData, batteryData, chargingData }) => {
  if (!routeData) {
    return (
      <div className="card h-full flex items-center justify-center min-h-[200px] bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="text-center text-gray-500 p-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Select a route to view analysis</p>
          <p className="text-sm text-gray-400 mt-2">Choose start and end locations to calculate energy requirements</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Battery Status */}
      <div className="card bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <Battery className="w-5 h-5 text-white" />
            </div>
            Battery Status
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Current Level</span>
            <span className="text-3xl font-bold text-green-600">
              {batteryData?.current?.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${batteryData?.current}%` }}
            >
              {batteryData?.current > 15 && (
                <span className="text-white text-xs font-bold drop-shadow">
                  {batteryData?.current?.toFixed(0)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-green-200">
            <span className="text-sm font-medium text-gray-600">After Trip</span>
            <span className={`font-bold text-lg ${
              batteryData?.afterTrip < 20 ? 'text-red-600' : 'text-gray-700'
            }`}>
              {batteryData?.afterTrip?.toFixed(1)}%
              {batteryData?.afterTrip < 20 && (
                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Low</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Route Information */}
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Navigation className="w-5 h-5 text-white" />
          </div>
          Route Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <InfoCard 
            label="Distance" 
            value={`${routeData?.distanceKm?.toFixed(2)}`}
            unit="km"
          />
          <InfoCard 
            label="Est. Time" 
            value={`${Math.round(routeData?.estimatedTime)}`}
            unit="min"
          />
          <InfoCard 
            label="Elevation Gain" 
            value={`${routeData?.elevationGain?.toFixed(1)}`}
            unit="m"
          />
          <InfoCard 
            label="Elevation Loss" 
            value={`${routeData?.elevationLoss?.toFixed(1)}`}
            unit="m"
          />
        </div>
      </div>

      {/* Energy Consumption */}
      <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
          <div className="p-2 bg-amber-500 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          Energy Consumption
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-baseline p-3 bg-white/60 rounded-lg">
            <span className="text-sm font-semibold text-gray-700">Total Energy</span>
            <span className="text-2xl font-bold text-amber-600">
              {routeData?.totalEnergy?.toFixed(3)} <span className="text-base">kWh</span>
            </span>
          </div>
          <div className="space-y-2 text-xs text-gray-700 pt-2">
            <EnergyBreakdownRow 
              label="Rolling Resistance" 
              value={routeData?.rollingResistance?.toFixed(3)}
              color="bg-orange-400"
            />
            <EnergyBreakdownRow 
              label="Air Resistance" 
              value={routeData?.airResistance?.toFixed(3)}
              color="bg-blue-400"
            />
            <EnergyBreakdownRow 
              label="Uphill Energy" 
              value={routeData?.uphillEnergy?.toFixed(3)}
              color="bg-red-400"
            />
            <EnergyBreakdownRow 
              label="Energy Recovered ↻" 
              value={routeData?.regeneratedEnergy?.toFixed(3)}
              color="bg-green-400"
              isRecovered
            />
          </div>
        </div>
      </div>

      {/* Efficiency Rating */}
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Gauge className="w-5 h-5 text-white" />
          </div>
          Efficiency Rating
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-3xl font-bold mb-2" style={{ 
              color: routeData?.efficiency?.color || '#gray' 
            }}>
              {routeData?.efficiency?.rating}
            </div>
            <div className="text-sm text-gray-600">
              Approximately {routeData?.efficiency?.efficiency}% efficient route
            </div>
          </div>
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg transform hover:scale-110 transition-transform"
            style={{ 
              backgroundColor: `${routeData?.efficiency?.color}30`,
              color: routeData?.efficiency?.color,
              border: `3px solid ${routeData?.efficiency?.color}`
            }}
          >
            {routeData?.efficiency?.efficiency}
          </div>
        </div>
      </div>

      {/* Charging Recommendation */}
      {chargingData && (
        <div className={`card shadow-lg hover:shadow-xl transition-shadow border-2 ${
          chargingData.needed 
            ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200' 
            : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
        }`}>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <div className={`p-2 rounded-lg ${chargingData.needed ? 'bg-red-500' : 'bg-green-500'}`}>
              <Clock className="w-5 h-5 text-white" />
            </div>
            {chargingData.needed ? 'Charging Required!' : 'Charging Status'}
          </h3>
          {chargingData.needed ? (
            <div className="space-y-4">
              <div className="p-3 bg-white/70 rounded-lg border-l-4 border-red-500">
                <p className="text-sm text-gray-700 font-medium">
                  {chargingData.reason}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <InfoCard 
                  label="Charge to" 
                  value={`${chargingData.targetBattery}`}
                  unit="%"
                  small
                />
                <InfoCard 
                  label="Time" 
                  value={`${chargingData.time.hours}h ${chargingData.time.minutes}m`}
                  unit=""
                  small
                />
                <InfoCard 
                  label="Energy" 
                  value={`${chargingData.time.energyNeeded?.toFixed(1)}`}
                  unit="kWh"
                  small
                />
              </div>
              <button className="btn-primary w-full py-3 text-base font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all">
                <Zap className="w-5 h-5 inline mr-2" />
                Start Charging Session
              </button>
            </div>
          ) : (
            <div className="p-4 bg-white/70 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-700 font-medium flex items-center gap-2">
                Battery level sufficient for this trip. No charging needed.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InfoCard = ({ label, value, unit, small }) => (
  <div className={`bg-white/70 rounded-lg ${small ? 'p-2' : 'p-3'} text-center shadow-sm hover:shadow-md transition-shadow`}>
    <div className={`font-bold text-gray-800 ${small ? 'text-base' : 'text-xl'}`}>
      {value}<span className="text-xs ml-1">{unit}</span>
    </div>
    <div className={`text-gray-600 ${small ? 'text-xs' : 'text-sm'} font-medium mt-1`}>{label}</div>
  </div>
);

const EnergyBreakdownRow = ({ label, value, color, isRecovered }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${color}`}></div>
    <span className="flex-1 font-medium">{label}</span>
    <span className={`font-bold ${isRecovered ? 'text-green-600' : 'text-gray-700'}`}>
      {isRecovered ? '-' : ''}{value} kWh
    </span>
  </div>
);

export default Dashboard;
