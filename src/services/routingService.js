/**
 * Routing Service
 * Fetches actual road routes using OpenRouteService API
 */

// OpenRouteService API (fallback, requires key)
// Sign up at https://openrouteservice.org/dev/#/signup for free API key
const ORS_API_KEY = ''; // Add your API key here if using ORS
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';

/**
 * Get actual road route between two points using OpenRouteService
 * @param {number} startLat - Starting latitude
 * @param {number} startLng - Starting longitude
 * @param {number} endLat - Ending latitude
 * @param {number} endLng - Ending longitude
 * @returns {Promise<Object>} Route data with coordinates and distance
 */
export async function getRouteFromAPI(startLat, startLng, endLat, endLng) {
  // Use OSRM as primary (free, no API key needed)
  return getRouteFromOSRM(startLat, startLng, endLat, endLng);
}

/**
 * Get route using OSRM (Open Source Routing Machine) - FREE, no API key needed
 */
async function getRouteFromOSRM(startLat, startLng, endLat, endLng) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }

    const data = await response.json();
    const route = data.routes[0];
    
    const coordinates = route.geometry.coordinates.map(coord => ({
      lng: coord[0],
      lat: coord[1]
    }));

    return {
      coordinates: coordinates,
      distance: route.distance, // in meters
      duration: route.duration, // in seconds
      success: true
    };
  } catch (error) {
    console.error('Error fetching route from OSRM:', error);
    // Final fallback: simple straight line
    return {
      coordinates: [
        { lat: startLat, lng: startLng },
        { lat: endLat, lng: endLng }
      ],
      distance: null,
      duration: null,
      success: false,
      error: 'Failed to fetch route. Using straight line.'
    };
  }
}

/**
 * Simplify route by sampling points for elevation lookup
 * (reduces API calls while maintaining accuracy)
 */
export function simplifyRoute(coordinates, maxPoints = 50) {
  if (coordinates.length <= maxPoints) {
    return coordinates;
  }

  const simplified = [];
  const step = Math.floor(coordinates.length / maxPoints);

  for (let i = 0; i < coordinates.length; i += step) {
    simplified.push(coordinates[i]);
  }

  // Always include the last point
  if (simplified[simplified.length - 1] !== coordinates[coordinates.length - 1]) {
    simplified.push(coordinates[coordinates.length - 1]);
  }

  return simplified;
}

