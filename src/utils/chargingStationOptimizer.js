import { calculateDistance } from './energyCalculator';
import { snapToNearestRoad } from '../services/roadSnappingService';

export async function findOptimalChargingLocation(routes, existingStations = []) {
  if (!routes || routes.length === 0) {
    return null;
  }

  const weightedPoints = [];
  
  routes.forEach(route => {
    const frequency = route.frequency || 1;
    
    weightedPoints.push({
      lat: route.start.lat,
      lng: route.start.lng,
      weight: frequency,
      type: 'start',
      routeId: route.id
    });
    
    weightedPoints.push({
      lat: route.end.lat,
      lng: route.end.lng,
      weight: frequency,
      type: 'end',
      routeId: route.id
    });
    
    const midLat = (route.start.lat + route.end.lat) / 2;
    const midLng = (route.start.lng + route.end.lng) / 2;
    weightedPoints.push({
      lat: midLat,
      lng: midLng,
      weight: frequency * 0.5,
      type: 'midpoint',
      routeId: route.id
    });
  });

  let totalWeight = 0;
  let weightedLatSum = 0;
  let weightedLngSum = 0;

  weightedPoints.forEach(point => {
    weightedLatSum += point.lat * point.weight;
    weightedLngSum += point.lng * point.weight;
    totalWeight += point.weight;
  });

  const optimalLat = weightedLatSum / totalWeight;
  const optimalLng = weightedLngSum / totalWeight;

  const snapped = await snapToNearestRoad(optimalLat, optimalLng);
  
  const finalLat = snapped.snapped ? snapped.lat : optimalLat;
  const finalLng = snapped.snapped ? snapped.lng : optimalLng;

  const metrics = calculateLocationMetrics(
    { lat: finalLat, lng: finalLng },
    routes,
    existingStations
  );

  return {
    lat: finalLat,
    lng: finalLng,
    originalLat: optimalLat,
    originalLng: optimalLng,
    snapped: snapped.snapped,
    snapDistance: snapped.distance,
    roadName: snapped.name,
    metrics: metrics,
    method: 'weighted_centroid'
  };
}

export function calculateLocationMetrics(location, routes, existingStations = []) {
  const routeMetrics = routes.map(route => {
    const frequency = route.frequency || 1;
    
    const distFromStart = calculateDistance(
      route.start.lat,
      route.start.lng,
      location.lat,
      location.lng
    );
    
    const distFromEnd = calculateDistance(
      route.end.lat,
      route.end.lng,
      location.lat,
      location.lng
    );
    
    const minDistance = Math.min(distFromStart, distFromEnd);
    
    return {
      routeId: route.id,
      routeName: route.name || `${route.start.name} to ${route.end.name}`,
      distanceToStation: minDistance,
      frequency: frequency,
      weightedDistance: minDistance * frequency
    };
  });

  const totalFrequency = routeMetrics.reduce((sum, m) => sum + m.frequency, 0);
  const totalWeightedDistance = routeMetrics.reduce((sum, m) => sum + m.weightedDistance, 0);
  const averageDistance = totalWeightedDistance / totalFrequency;
  const maxDistance = Math.max(...routeMetrics.map(m => m.distanceToStation));
  const acceptableDistance = 500;
  const coveredRoutes = routeMetrics.filter(m => m.distanceToStation <= acceptableDistance).length;
  const coveragePercentage = (coveredRoutes / routes.length) * 100;

  let improvementVsExisting = null;
  if (existingStations.length > 0) {
    const existingMetrics = existingStations.map(station => 
      calculateLocationMetrics(station, routes, [])
    );
    const bestExistingAvgDist = Math.min(...existingMetrics.map(m => m.averageDistance));
    improvementVsExisting = ((bestExistingAvgDist - averageDistance) / bestExistingAvgDist) * 100;
  }

  return {
    routeMetrics: routeMetrics,
    averageDistance: averageDistance,
    maxDistance: maxDistance,
    coveragePercentage: coveragePercentage,
    totalDailyTrips: totalFrequency,
    improvementVsExisting: improvementVsExisting
  };
}

export async function findMultipleOptimalLocations(routes, numStations = 2) {
  if (!routes || routes.length === 0 || numStations < 1) {
    return [];
  }

  const allPoints = [];
  routes.forEach(route => {
    const frequency = route.frequency || 1;
    allPoints.push({
      lat: route.start.lat,
      lng: route.start.lng,
      weight: frequency,
      route: route
    });
    allPoints.push({
      lat: route.end.lat,
      lng: route.end.lng,
      weight: frequency,
      route: route
    });
  });

  const clusters = [];
  for (let i = 0; i < Math.min(numStations, allPoints.length); i++) {
    const randomPoint = allPoints[Math.floor(Math.random() * allPoints.length)];
    clusters.push({
      lat: randomPoint.lat,
      lng: randomPoint.lng,
      points: []
    });
  }

  const maxIterations = 10;
  for (let iter = 0; iter < maxIterations; iter++) {
    clusters.forEach(c => c.points = []);

    allPoints.forEach(point => {
      let minDist = Infinity;
      let nearestCluster = null;

      clusters.forEach(cluster => {
        const dist = calculateDistance(
          point.lat,
          point.lng,
          cluster.lat,
          cluster.lng
        );
        if (dist < minDist) {
          minDist = dist;
          nearestCluster = cluster;
        }
      });

      if (nearestCluster) {
        nearestCluster.points.push(point);
      }
    });

    clusters.forEach(cluster => {
      if (cluster.points.length > 0) {
        let totalWeight = 0;
        let weightedLatSum = 0;
        let weightedLngSum = 0;

        cluster.points.forEach(point => {
          weightedLatSum += point.lat * point.weight;
          weightedLngSum += point.lng * point.weight;
          totalWeight += point.weight;
        });

        cluster.lat = weightedLatSum / totalWeight;
        cluster.lng = weightedLngSum / totalWeight;
      }
    });
  }

  const validClusters = clusters.filter(c => c.points.length > 0);
  const snappingPromises = validClusters.map(async (cluster, index) => {
    const snapped = await snapToNearestRoad(cluster.lat, cluster.lng);
    const finalLat = snapped.snapped ? snapped.lat : cluster.lat;
    const finalLng = snapped.snapped ? snapped.lng : cluster.lng;

    return {
      id: `optimal-station-${index + 1}`,
      lat: finalLat,
      lng: finalLng,
      originalLat: cluster.lat,
      originalLng: cluster.lng,
      snapped: snapped.snapped,
      snapDistance: snapped.distance,
      roadName: snapped.name,
      metrics: calculateLocationMetrics(
        { lat: finalLat, lng: finalLng },
        routes,
        []
      ),
      assignedRoutes: cluster.points.map(p => p.route.id)
    };
  });

  return Promise.all(snappingPromises);
}

export function compareStationPlacements(scenarios, routes) {
  return scenarios.map(scenario => {
    const metrics = calculateLocationMetrics(scenario.location, routes, []);
    return {
      ...scenario,
      metrics: metrics,
      score: calculatePlacementScore(metrics)
    };
  }).sort((a, b) => b.score - a.score);
}

function calculatePlacementScore(metrics) {
  const avgDistWeight = 0.4;
  const coverageWeight = 0.3;
  const maxDistWeight = 0.3;

  const avgDistScore = Math.max(0, 100 - (metrics.averageDistance / 10));
  const coverageScore = metrics.coveragePercentage;
  const maxDistScore = Math.max(0, 100 - (metrics.maxDistance / 15));

  return (
    avgDistScore * avgDistWeight +
    coverageScore * coverageWeight +
    maxDistScore * maxDistWeight
  );
}

export async function suggestStationImprovement(existingStation, routes) {
  const currentMetrics = calculateLocationMetrics(existingStation, routes, []);
  const optimalLocation = await findOptimalChargingLocation(routes, [existingStation]);

  const improvementDistance = calculateDistance(
    existingStation.lat,
    existingStation.lng,
    optimalLocation.lat,
    optimalLocation.lng
  );

  return {
    currentMetrics: currentMetrics,
    optimalLocation:     optimalLocation,
    improvementDistance: improvementDistance,
    shouldRelocate: improvementDistance > 100,
    averageDistanceImprovement: currentMetrics.averageDistance - optimalLocation.metrics.averageDistance,
    coverageImprovement: optimalLocation.metrics.coveragePercentage - currentMetrics.coveragePercentage
  };
}

