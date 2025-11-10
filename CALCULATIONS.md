# EV Charging Optimizer - Calculations & Data Sources

## Overview
This document explains how all calculations are performed and where the data comes from in the EV Charging Optimizer application.

---

## 1. Elevation Data Sources

### Current Implementation: **SYNTHETIC/SIMULATED DATA**

⚠️ **Important**: The elevation data is currently **NOT REAL**. It uses estimated and mathematically generated values.

### 1.1 Manual Elevation Values

Each campus location has a hardcoded elevation value (in meters above sea level):

| Location | Latitude | Longitude | Elevation | Source |
|----------|----------|-----------|-----------|--------|
| Campus Center | 15.392096 | 73.879556 | 185m | GPS (Actual) |
| Main Gate | 15.387352 | 73.875786 | 170m | GPS (Actual) |
| Academic Block | 15.391800 | 73.879200 | 185m | Estimated |
| Library | 15.391583 | 73.880444 | 188m | GPS (Actual) - 15°23'29.7"N 73°52'49.6"E |
| Sports Complex | 15.390500 | 73.880800 | 175m | Estimated |
| Hostel Area | 15.391133 | 73.876518 | 190m | GPS (Actual) |
| Admin Block | 15.392806 | 73.880500 | 182m | GPS (Actual) - 15°23'34.1"N 73°52'49.8"E |
| Cafeteria | 15.392803 | 73.884299 | 186m | GPS (Actual) |
| Charging Station | 15.391500 | 73.880000 | 180m | Estimated (near campus center) |

**File**: `src/data/campusData.js` (lines 27-84)

### 1.2 Route Elevation Interpolation

For points between locations, elevation is calculated using mathematical interpolation:

```javascript
function getElevationAtPoint(lat, lng) {
  // Calculate distance from campus center
  const distFromCenter = Math.sqrt(
    Math.pow(lat - CAMPUS_CENTER.lat, 2) +
    Math.pow(lng - CAMPUS_CENTER.lng, 2)
  );

  // Add artificial terrain variation using trigonometric functions
  const variation = Math.sin(lat * 100) * 5 + Math.cos(lng * 100) * 5;
  
  // Calculate elevation
  const elevation = CAMPUS_CENTER.elevation + variation - distFromCenter * 5000;

  // Clamp between 160-200m
  return Math.max(160, Math.min(200, elevation));
}
```

**File**: `src/data/campusData.js` (lines 170-181)

**Method**: Uses sine and cosine functions to create artificial terrain variation. This is purely mathematical and does not reflect actual terrain.

### 1.3 Elevation Profile Generation

When a route is selected, the system generates an elevation profile with 20 points:

```javascript
function generateElevationProfile(startElev, endElev, distance, points = 20) {
  const profile = [];
  const elevChange = endElev - startElev;

  for (let i = 0; i <= points; i++) {
    const progress = i / points;
    const distanceAtPoint = (distance * progress) / 1000; // km

    // Linear interpolation + sinusoidal variation
    const baseElevation = startElev + elevChange * progress;
    const variation = Math.sin(progress * Math.PI * 3) * 5; // ±5m variation

    profile.push({
      distance: distanceAtPoint,
      elevation: baseElevation + variation,
    });
  }

  return profile;
}
```

**File**: `src/utils/energyCalculator.js` (lines 155-174)

---

## 2. Distance Calculations

### 2.1 Haversine Formula

Distance between two GPS coordinates is calculated using the **Haversine formula**, which accounts for Earth's curvature:

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
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
```

**File**: `src/utils/energyCalculator.js` (lines 23-36)

**Accuracy**: ✅ Highly accurate (within a few meters for short distances)

---

## 3. Energy Consumption Calculations

### 3.1 Vehicle Parameters

All calculations use these constants for a typical mid-size EV:

```javascript
const CONSTANTS = {
  GRAVITY: 9.81,                    // m/s² (standard)
  AIR_DENSITY: 1.225,              // kg/m³ (sea level)
  ROLLING_RESISTANCE: 0.01,        // Coefficient (typical for EVs)
  DRAG_COEFFICIENT: 0.28,          // Cd (modern EVs like Tesla Model 3)
  FRONTAL_AREA: 2.3,               // m² (typical EV)
  BATTERY_CAPACITY: 60,            // kWh (mid-size EV)
  VEHICLE_MASS: 1800,              // kg (including passengers)
  MOTOR_EFFICIENCY: 0.90,          // 90% (typical EV motor)
  REGENERATIVE_EFFICIENCY: 0.70,   // 70% recovery on downhill
  AVERAGE_SPEED: 40,               // km/h (campus speed limit)
};
```

**File**: `src/utils/energyCalculator.js` (lines 7-18)

### 3.2 Energy Components

#### A. Rolling Resistance Energy

Energy lost due to tire deformation and friction with the road:

```
E_rolling = m × g × C_rr × d

Where:
  m = vehicle mass (1800 kg)
  g = gravity (9.81 m/s²)
  C_rr = rolling resistance coefficient (0.01)
  d = distance (meters)

Example:
  For 1000m distance:
  E = 1800 × 9.81 × 0.01 × 1000 = 176,580 Joules = 0.049 kWh
```

**File**: `src/utils/energyCalculator.js` (lines 46-50)

#### B. Air Resistance Energy

Energy required to overcome aerodynamic drag:

```
E_air = 0.5 × ρ × C_d × A × v² × d

Where:
  ρ = air density (1.225 kg/m³)
  C_d = drag coefficient (0.28)
  A = frontal area (2.3 m²)
  v = velocity (11.11 m/s for 40 km/h)
  d = distance (meters)

Example:
  For 1000m at 40 km/h:
  E = 0.5 × 1.225 × 0.28 × 2.3 × (11.11)² × 1000 = 43,611 Joules = 0.012 kWh
```

**File**: `src/utils/energyCalculator.js` (lines 53-59)

#### C. Uphill Energy (Potential Energy)

Energy required to climb elevation:

```
E_uphill = m × g × h

Where:
  m = vehicle mass (1800 kg)
  g = gravity (9.81 m/s²)
  h = elevation gain (meters)

Example:
  For 10m elevation gain:
  E = 1800 × 9.81 × 10 = 176,580 Joules = 0.049 kWh
```

**File**: `src/utils/energyCalculator.js` (line 62)

#### D. Regenerative Braking (Downhill)

Energy recovered when going downhill:

```
E_recovered = m × g × h × η_regen

Where:
  m = vehicle mass (1800 kg)
  g = gravity (9.81 m/s²)
  h = elevation loss (meters)
  η_regen = regenerative efficiency (0.70 = 70%)

Example:
  For 10m elevation loss:
  E = 1800 × 9.81 × 10 × 0.70 = 123,606 Joules = 0.034 kWh recovered
```

**File**: `src/utils/energyCalculator.js` (lines 65-69)

### 3.3 Total Energy Calculation

```
E_total = (E_rolling + E_air + E_uphill - E_recovered) / η_motor

Where:
  η_motor = motor efficiency (0.90 = 90%)

Convert Joules to kWh:
  E_kWh = E_joules / 3,600,000
```

**File**: `src/utils/energyCalculator.js` (lines 72-77)

**Accuracy**: ✅ Physics-based formulas are accurate. Results depend on elevation data accuracy.

---

## 4. Battery Calculations

### 4.1 Battery Consumption

```javascript
function calculateRemainingBattery(currentBattery, energyConsumed) {
  const batteryUsed = (energyConsumed / BATTERY_CAPACITY) * 100;
  return Math.max(0, currentBattery - batteryUsed);
}
```

**Example**:
- Current battery: 80%
- Energy consumed: 0.5 kWh
- Battery capacity: 60 kWh
- Battery used: (0.5 / 60) × 100 = 0.83%
- Remaining: 80 - 0.83 = 79.17%

**File**: `src/utils/energyCalculator.js` (lines 93-96)

### 4.2 Charging Time

```javascript
function calculateChargingTime(currentBattery, targetBattery, chargingPower = 7.4) {
  const energyNeeded = ((targetBattery - currentBattery) / 100) * BATTERY_CAPACITY;
  const chargingTimeHours = energyNeeded / chargingPower;
  
  return {
    hours: Math.floor(chargingTimeHours),
    minutes: Math.round((chargingTimeHours % 1) * 60),
    totalMinutes: Math.round(chargingTimeHours * 60),
    energyNeeded: energyNeeded,
  };
}
```

**Example**:
- Current battery: 30%
- Target battery: 80%
- Battery capacity: 60 kWh
- Charging power: 7.4 kW (Level 2 charger)
- Energy needed: ((80 - 30) / 100) × 60 = 30 kWh
- Time: 30 / 7.4 = 4.05 hours = 4h 3min

**File**: `src/utils/energyCalculator.js` (lines 101-112)

---

## 5. Elevation Analysis

### 5.1 Elevation Gain and Loss

```javascript
function calculateElevationChanges(elevationProfile) {
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
```

The function analyzes the elevation profile point by point, summing all uphill sections (gain) and downhill sections (loss).

**File**: `src/utils/energyCalculator.js` (lines 179-193)

### 5.2 Efficiency Rating

Based on average gradient:

```javascript
function getEfficiencyRating(elevationGain, distance) {
  const gradient = (elevationGain / distance) * 100;

  if (gradient < 2) return { rating: 'Excellent', color: 'green', efficiency: 95 };
  if (gradient < 4) return { rating: 'Good', color: 'lime', efficiency: 85 };
  if (gradient < 6) return { rating: 'Moderate', color: 'yellow', efficiency: 75 };
  if (gradient < 8) return { rating: 'Poor', color: 'orange', efficiency: 65 };
  return { rating: 'Very Poor', color: 'red', efficiency: 55 };
}
```

**Gradient Calculation**:
```
gradient (%) = (elevation_gain / distance) × 100

Example:
  Elevation gain: 15m
  Distance: 500m
  Gradient: (15 / 500) × 100 = 3%
  Rating: Good (85% efficiency)
```

**File**: `src/utils/energyCalculator.js` (lines 198-206)

---

## 6. How to Get Real Elevation Data

### Option 1: Open Elevation API (FREE)

```javascript
async function getRealElevation(lat, lng) {
  const response = await fetch(
    `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`
  );
  const data = await response.json();
  return data.results[0].elevation; // Returns elevation in meters
}
```

**Pros**:
- Free and open source
- No API key required
- Global coverage

**Cons**:
- Lower accuracy (~10-30m error)
- Slower response times

### Option 2: Google Maps Elevation API (PAID)

```javascript
async function getGoogleElevation(lat, lng, apiKey) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lng}&key=${apiKey}`
  );
  const data = await response.json();
  return data.results[0].elevation;
}
```

**Pros**:
- High accuracy (~1-5m error)
- Fast response
- Reliable

**Cons**:
- Requires API key
- Costs money after free tier ($5 per 1000 requests)

### Option 3: SRTM DEM Data Files

Download Shuttle Radar Topography Mission (SRTM) digital elevation model data:

**Sources**:
- [USGS Earth Explorer](https://earthexplorer.usgs.gov/)
- [OpenTopography](https://opentopography.org/)
- [NASA SRTM](https://www2.jpl.nasa.gov/srtm/)

**Coverage**: 30m resolution for most of the world

**Implementation**: Parse SRTM HGT files and lookup elevation by coordinates

### Option 4: Manual GPS Survey

Use GPS-enabled devices to measure actual elevations:

**Tools**:
- Smartphone GPS apps (e.g., GPS Status & Toolbox)
- Handheld GPS devices (Garmin, etc.)
- Survey-grade GPS equipment (for high accuracy)

**Method**:
1. Visit each location on BITS Goa campus
2. Record GPS coordinates and elevation
3. Update `campusData.js` with measured values

---

## 7. Calculation Flow

### When a Route is Selected:

```
1. User selects start and end locations
   ↓
2. Calculate distance using Haversine formula
   ↓
3. Generate 20-point elevation profile
   ↓
4. Calculate elevation gain and loss from profile
   ↓
5. Calculate energy components:
   - Rolling resistance energy
   - Air resistance energy
   - Uphill energy (from elevation gain)
   - Regenerative energy (from elevation loss)
   ↓
6. Calculate total energy consumption
   ↓
7. Calculate remaining battery
   ↓
8. Determine if charging is needed (< 20% threshold)
   ↓
9. If charging needed, calculate charging time
   ↓
10. Display all results in dashboard and elevation report
```

---

## 8. Limitations & Assumptions

### Current Limitations:

1. **Elevation Data**: Synthetic/estimated, not based on real surveys
2. **Route Path**: Straight line between points, doesn't follow actual roads
3. **Traffic**: Assumes constant speed (40 km/h)
4. **Weather**: No temperature or wind effects
5. **Driver Behavior**: Assumes optimal driving
6. **Road Conditions**: Assumes good road surface
7. **Vehicle Load**: Fixed at 1800 kg

### Assumptions:

- Vehicle mass includes average passenger weight
- Motor efficiency is constant (90%)
- Regenerative braking captures 70% of potential energy
- No auxiliary power consumption (AC, heating, etc.)
- Tire pressure is optimal
- Battery chemistry doesn't degrade over time

---

## 9. Accuracy Assessment

| Component | Accuracy | Notes |
|-----------|----------|-------|
| Distance Calculation | ✅ Very High | Haversine formula is accurate |
| Elevation Data | ❌ Low | Currently synthetic/estimated |
| Rolling Resistance | ✅ High | Based on standard physics |
| Air Resistance | ✅ High | Standard aerodynamic formulas |
| Uphill Energy | ⚠️ Medium | Accurate formula, inaccurate elevation data |
| Regenerative Energy | ⚠️ Medium | Accurate formula, inaccurate elevation data |
| Battery Calculations | ✅ High | Standard EV battery math |
| Charging Time | ✅ High | Based on actual charger specs |

**Overall Accuracy**: The physics and mathematics are correct, but results are limited by the quality of elevation data.

---

## 10. Future Improvements

### To Improve Accuracy:

1. **Integrate real elevation API** (Open Elevation or Google)
2. **Use actual road paths** instead of straight lines
3. **Add weather effects** (temperature, wind)
4. **Include auxiliary power consumption** (HVAC, lights)
5. **Add route optimization** for minimum energy consumption
6. **Support multiple vehicle profiles** with different parameters
7. **Include real-time traffic data** for speed adjustments
8. **Add historical trip data** for machine learning predictions

### To Add Features:

1. **Multiple charging stations** with pathfinding
2. **Daily trip planning** with multiple stops
3. **Cost analysis** (electricity costs)
4. **CO2 savings** compared to ICE vehicles
5. **Battery health tracking** over time
6. **Charging station availability** in real-time

---

## References

### Physics & Mathematics:
- Haversine Formula: https://en.wikipedia.org/wiki/Haversine_formula
- Rolling Resistance: https://en.wikipedia.org/wiki/Rolling_resistance
- Drag Equation: https://en.wikipedia.org/wiki/Drag_equation
- Electric Vehicle Efficiency: https://en.wikipedia.org/wiki/Electric_vehicle_battery

### Data Sources:
- BITS Goa Center Coordinates: 15.392096, 73.879556 (GPS - Actual)
- Campus Location Coordinates: Estimated based on campus layout
- Elevation Values: Estimated (to be replaced with real data)
- EV Parameters: Tesla Model 3, Nissan Leaf specifications
- Physics Constants: Standard atmospheric values

---

## Contact & Contributions

For questions about calculations or to contribute improvements, please refer to the main README.md file.

Last Updated: November 10, 2025

