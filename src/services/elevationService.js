/**
 * Elevation Service
 * Fetches real elevation data from Open Elevation API
 */

const OPEN_ELEVATION_API = 'https://api.open-elevation.com/api/v1/lookup';

/**
 * Get real elevation data for multiple points
 * @param {Array} coordinates - Array of {lat, lng} objects
 * @returns {Promise<Array>} Array of {lat, lng, elevation} objects
 */
export async function getElevationForRoute(coordinates) {
  try {
    // Open Elevation API accepts max 100 points per request
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < coordinates.length; i += batchSize) {
      const batch = coordinates.slice(i, i + batchSize);
      const batchResults = await fetchElevationBatch(batch);
      results.push(...batchResults);
    }

    return results;
  } catch (error) {
    console.error('Error fetching elevation data:', error);
    // Fallback: return coordinates with estimated elevation
    return coordinates.map(coord => ({
      ...coord,
      elevation: 185, // Default elevation for BITS Goa
      estimated: true
    }));
  }
}

/**
 * Fetch elevation for a batch of coordinates
 */
async function fetchElevationBatch(coordinates) {
  try {
    const locations = coordinates.map(coord => `${coord.lat},${coord.lng}`).join('|');
    const url = `${OPEN_ELEVATION_API}?locations=${locations}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Elevation API error: ${response.status}`);
    }

    const data = await response.json();

    return data.results.map((result, index) => ({
      lat: coordinates[index].lat,
      lng: coordinates[index].lng,
      elevation: result.elevation,
      estimated: false
    }));
  } catch (error) {
    console.error('Error in elevation batch:', error);
    // Return with default elevation
    return coordinates.map(coord => ({
      ...coord,
      elevation: 185,
      estimated: true
    }));
  }
}

/**
 * Get elevation for a single point
 */
export async function getElevationForPoint(lat, lng) {
  try {
    const response = await fetch(`${OPEN_ELEVATION_API}?locations=${lat},${lng}`);
    
    if (!response.ok) {
      throw new Error(`Elevation API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      lat,
      lng,
      elevation: data.results[0].elevation,
      estimated: false
    };
  } catch (error) {
    console.error('Error fetching single elevation:', error);
    return {
      lat,
      lng,
      elevation: 185,
      estimated: true
    };
  }
}

/**
 * Calculate cumulative distance along route
 */
export function calculateDistanceAlongRoute(coordinates) {
  const distances = [0];
  let cumulative = 0;

  for (let i = 1; i < coordinates.length; i++) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (coordinates[i - 1].lat * Math.PI) / 180;
    const φ2 = (coordinates[i].lat * Math.PI) / 180;
    const Δφ = ((coordinates[i].lat - coordinates[i - 1].lat) * Math.PI) / 180;
    const Δλ = ((coordinates[i].lng - coordinates[i - 1].lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    cumulative += R * c;
    distances.push(cumulative);
  }

  return distances;
}

/**
 * Prepare elevation profile data for charting
 */
export function prepareElevationProfile(coordinatesWithElevation) {
  const distances = calculateDistanceAlongRoute(coordinatesWithElevation);

  return coordinatesWithElevation.map((coord, index) => ({
    distance: distances[index] / 1000, // Convert to km
    elevation: coord.elevation,
    lat: coord.lat,
    lng: coord.lng
  }));
}

