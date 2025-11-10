/**
 * EV Energy Consumption Calculator
 * Calculates energy requirements based on distance, elevation, and vehicle parameters
 */

// Constants for EV calculations
const CONSTANTS = {
  GRAVITY: 9.81, // m/s^2
  AIR_DENSITY: 1.225, // kg/m^3
  ROLLING_RESISTANCE: 0.01, // Typical for EVs
  DRAG_COEFFICIENT: 0.28, // Typical for modern EVs
  FRONTAL_AREA: 2.3, // m^2 (typical EV)
  BATTERY_CAPACITY: 60, // kWh (typical mid-size EV)
  VEHICLE_MASS: 1800, // kg
  MOTOR_EFFICIENCY: 0.90, // 90% efficiency
  REGENERATIVE_EFFICIENCY: 0.70, // 70% energy recovery on downhill
  AVERAGE_SPEED: 40, // km/h (campus speed)
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Calculate energy consumption based on route parameters
 */
export function calculateEnergyConsumption(distance, elevationGain, elevationLoss) {
  const distanceKm = distance / 1000;
  const speedMs = (CONSTANTS.AVERAGE_SPEED * 1000) / 3600;

  // Rolling resistance energy
  const rollingResistanceEnergy =
    CONSTANTS.VEHICLE_MASS *
    CONSTANTS.GRAVITY *
    CONSTANTS.ROLLING_RESISTANCE *
    distance;

  // Air resistance energy
  const dragEnergy =
    0.5 *
    CONSTANTS.AIR_DENSITY *
    CONSTANTS.DRAG_COEFFICIENT *
    CONSTANTS.FRONTAL_AREA *
    Math.pow(speedMs, 2) *
    distance;

  // Potential energy (uphill)
  const uphillEnergy = CONSTANTS.VEHICLE_MASS * CONSTANTS.GRAVITY * elevationGain;

  // Regenerative braking (downhill) - energy recovered
  const downhillEnergyRecovered =
    CONSTANTS.VEHICLE_MASS *
    CONSTANTS.GRAVITY *
    elevationLoss *
    CONSTANTS.REGENERATIVE_EFFICIENCY;

  // Total energy in Joules
  const totalEnergyJoules =
    (rollingResistanceEnergy + dragEnergy + uphillEnergy - downhillEnergyRecovered) /
    CONSTANTS.MOTOR_EFFICIENCY;

  // Convert to kWh
  const energyKwh = totalEnergyJoules / (3.6e6);

  return {
    totalEnergy: Math.max(0, energyKwh),
    rollingResistance: rollingResistanceEnergy / 3.6e6,
    airResistance: dragEnergy / 3.6e6,
    uphillEnergy: uphillEnergy / 3.6e6,
    regeneratedEnergy: downhillEnergyRecovered / 3.6e6,
    distanceKm: distanceKm,
    estimatedTime: (distanceKm / CONSTANTS.AVERAGE_SPEED) * 60, // minutes
  };
}

/**
 * Calculate remaining battery percentage after a trip
 */
export function calculateRemainingBattery(currentBattery, energyConsumed) {
  const batteryUsed = (energyConsumed / CONSTANTS.BATTERY_CAPACITY) * 100;
  return Math.max(0, currentBattery - batteryUsed);
}

/**
 * Calculate charging time needed
 */
export function calculateChargingTime(currentBattery, targetBattery, chargingPower = 7.4) {
  // chargingPower in kW (default 7.4kW for Level 2 charging)
  const energyNeeded =
    ((targetBattery - currentBattery) / 100) * CONSTANTS.BATTERY_CAPACITY;
  const chargingTimeHours = energyNeeded / chargingPower;
  return {
    hours: Math.floor(chargingTimeHours),
    minutes: Math.round((chargingTimeHours % 1) * 60),
    totalMinutes: Math.round(chargingTimeHours * 60),
    energyNeeded: energyNeeded,
  };
}

/**
 * Calculate optimal charging intervals throughout the day
 */
export function calculateChargingIntervals(trips, initialBattery = 80) {
  const chargingIntervals = [];
  let currentBattery = initialBattery;
  const minBatteryThreshold = 20; // Don't let battery go below 20%

  trips.forEach((trip, index) => {
    const batteryAfterTrip = calculateRemainingBattery(
      currentBattery,
      trip.energyRequired
    );

    // If battery will go below threshold, charge before the trip
    if (batteryAfterTrip < minBatteryThreshold) {
      const chargingNeeded = calculateChargingTime(currentBattery, 80);
      chargingIntervals.push({
        beforeTrip: index + 1,
        currentBattery: currentBattery,
        chargeTo: 80,
        chargingTime: chargingNeeded,
        reason: `Battery would drop to ${batteryAfterTrip.toFixed(1)}% after trip ${
          index + 1
        }`,
      });
      currentBattery = 80;
    }

    currentBattery = calculateRemainingBattery(currentBattery, trip.energyRequired);
  });

  return {
    intervals: chargingIntervals,
    finalBattery: currentBattery,
  };
}

/**
 * Generate sample elevation profile based on distance
 */
export function generateElevationProfile(startElev, endElev, distance, points = 20) {
  const profile = [];
  const elevChange = endElev - startElev;

  for (let i = 0; i <= points; i++) {
    const progress = i / points;
    const distanceAtPoint = (distance * progress) / 1000; // km

    // Add some realistic terrain variation
    const baseElevation = startElev + elevChange * progress;
    const variation = Math.sin(progress * Math.PI * 3) * 5; // ±5m variation

    profile.push({
      distance: distanceAtPoint,
      elevation: baseElevation + variation,
    });
  }

  return profile;
}

/**
 * Calculate elevation gain and loss from elevation profile
 */
export function calculateElevationChanges(elevationProfile) {
  let gain = 0;
  let loss = 0;

  for (let i = 1; i < elevationProfile.length; i++) {
    const diff = elevationProfile[i].elevation - elevationProfile[i - 1].elevation;
    if (diff > 0) {
      gain += diff;
    } else {
      loss += Math.abs(diff);
    }
  }

  return { gain, loss };
}

/**
 * Get efficiency rating based on terrain
 */
export function getEfficiencyRating(elevationGain, distance) {
  const gradient = (elevationGain / distance) * 100;

  if (gradient < 2) return { rating: 'Excellent', color: 'green', efficiency: 95 };
  if (gradient < 4) return { rating: 'Good', color: 'lime', efficiency: 85 };
  if (gradient < 6) return { rating: 'Moderate', color: 'yellow', efficiency: 75 };
  if (gradient < 8) return { rating: 'Poor', color: 'orange', efficiency: 65 };
  return { rating: 'Very Poor', color: 'red', efficiency: 55 };
}

export { CONSTANTS };

