/**
 * Road Snapping Service
 * Snaps coordinates to nearest accessible road using OSRM
 */

const OSRM_NEAREST_URL = 'https://router.project-osrm.org/nearest/v1/driving';

export async function snapToNearestRoad(lat, lng, maxRadius = 1000) {
  try {
    const url = `${OSRM_NEAREST_URL}/${lng},${lat}?number=1`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OSRM nearest API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.waypoints && data.waypoints.length > 0) {
      const snapped = data.waypoints[0];
      const snappedLat = snapped.location[1];
      const snappedLng = snapped.location[0];
      const distance = snapped.distance;

      if (distance > maxRadius) {
        console.warn(`Snapped location too far (${distance}m), using original`);
        return { lat, lng, snapped: false };
      }

      return {
        lat: snappedLat,
        lng: snappedLng,
        snapped: true,
        distance: distance,
        name: snapped.name || 'Unnamed road'
      };
    }

    return { lat, lng, snapped: false };
  } catch (error) {
    console.error('Road snapping failed:', error);
    return { lat, lng, snapped: false };
  }
}

