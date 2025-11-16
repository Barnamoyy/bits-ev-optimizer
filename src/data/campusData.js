/**
 * BITS Goa Campus Data
 * Coordinates and elevation data for the campus
 */

// BITS Goa campus center coordinates (actual GPS coordinates)
export const CAMPUS_CENTER = {
  lat: 15.392096,
  lng: 73.879556,
  elevation: 185, // meters above sea level (approximate)
};

// Charging station location (single point for now)
export const CHARGING_STATION = {
  id: 'cs-001',
  name: 'Main Campus Charging Station',
  lat: 15.391500,
  lng: 73.880000,
  elevation: 180,
  power: 7.4, // kW
  type: 'Level 2',
  availability: 'Available',
  connectorType: 'Type 2',
};

// Key locations on campus with elevation data (ACTUAL GPS COORDINATES)
export const CAMPUS_LOCATIONS = [
  {
    id: 'main-gate',
    name: 'Main Gate',
    lat: 15.387352,
    lng: 73.875786,
    elevation: 170,
    type: 'entry',
  },
  {
    id: 'academic-block',
    name: 'Academic Block',
    lat: 15.391800,
    lng: 73.879200,
    elevation: 185,
    type: 'building',
  },
  {
    id: 'library',
    name: 'Library',
    lat: 15.391583,
    lng: 73.880444,
    elevation: 188,
    type: 'building',
  },
  {
    id: 'sports-complex',
    name: 'Sports Complex',
    lat: 15.390500,
    lng: 73.880800,
    elevation: 175,
    type: 'facility',
  },
  {
    id: 'hostels',
    name: 'Hostel Area',
    lat: 15.391133,
    lng: 73.876518,
    elevation: 190,
    type: 'residential',
  },
  {
    id: 'admin-block',
    name: 'Administration Block',
    lat: 15.392806,
    lng: 73.880500,
    elevation: 182,
    type: 'building',
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    lat: 15.392803,
    lng: 73.884299,
    elevation: 186,
    type: 'facility',
  },
];

// Sample routes for demonstration
export const SAMPLE_ROUTES = [
  {
    id: 'route-1',
    name: 'Main Gate to Charging Station',
    start: 'main-gate',
    end: 'cs-001',
    description: 'Entry point to charging station',
  },
  {
    id: 'route-2',
    name: 'Charging Station to Academic Block',
    start: 'cs-001',
    end: 'academic-block',
    description: 'Morning commute route',
  },
  {
    id: 'route-3',
    name: 'Academic Block to Cafeteria',
    start: 'academic-block',
    end: 'cafeteria',
    description: 'Lunch break route',
  },
  {
    id: 'route-4',
    name: 'Library to Sports Complex',
    start: 'library',
    end: 'sports-complex',
    description: 'Evening recreation route',
  },
];

// Generate 3D terrain grid data for the campus area
export function generateTerrainGrid(resolution = 20) {
  const terrainData = [];
  const bounds = {
    minLat: 15.3865,
    maxLat: 15.3940,
    minLng: 73.8750,
    maxLng: 73.8850,
  };

  const latStep = (bounds.maxLat - bounds.minLat) / resolution;
  const lngStep = (bounds.maxLng - bounds.minLng) / resolution;

  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const lat = bounds.minLat + i * latStep;
      const lng = bounds.minLng + j * lngStep;

      // Generate realistic elevation based on distance from center
      const distFromCenter = Math.sqrt(
        Math.pow(lat - CAMPUS_CENTER.lat, 2) +
        Math.pow(lng - CAMPUS_CENTER.lng, 2)
      );

      // Create elevation profile with some variation
      const baseElevation = CAMPUS_CENTER.elevation;
      const variation = Math.sin(i * 0.5) * 10 + Math.cos(j * 0.5) * 8;
      const distanceEffect = distFromCenter * 10000; // Scale effect

      const elevation = baseElevation + variation - distanceEffect;

      terrainData.push({
        position: [lng, lat],
        elevation: Math.max(160, Math.min(200, elevation)), // Clamp between 160-200m
        color: getElevationColor(elevation),
      });
    }
  }

  return terrainData;
}

// Color coding for elevation
function getElevationColor(elevation) {
  if (elevation < 170) return [139, 69, 19]; // Brown (low)
  if (elevation < 180) return [34, 139, 34]; // Green (medium-low)
  if (elevation < 190) return [144, 238, 144]; // Light green (medium)
  if (elevation < 195) return [255, 255, 153]; // Yellow (medium-high)
  return [255, 165, 0]; // Orange (high)
}

// Get elevation at a specific coordinate (interpolated)
export function getElevationAtPoint(lat, lng) {
  // Simple interpolation based on distance from campus center
  const distFromCenter = Math.sqrt(
    Math.pow(lat - CAMPUS_CENTER.lat, 2) +
    Math.pow(lng - CAMPUS_CENTER.lng, 2)
  );

  const variation = Math.sin(lat * 100) * 5 + Math.cos(lng * 100) * 5;
  const elevation = CAMPUS_CENTER.elevation + variation - distFromCenter * 5000;

  return Math.max(160, Math.min(200, elevation));
}

