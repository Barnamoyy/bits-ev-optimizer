# Optimal Charging Station Location Finder

## Overview

This feature helps you find the **optimal location(s) for charging stations** on the BITS Goa campus based on multiple common routes and their frequencies.

---

## The Problem

Where should you place a charging station to minimize:
- Average travel distance for all users
- Maximum distance any user has to travel
- Overall energy consumption

---

## How It Works

### 1. **Weighted Centroid Method**

The algorithm finds the optimal location using a weighted centroid approach:

```
For each route:
  - Consider start point (weight = frequency)
  - Consider end point (weight = frequency)
  - Consider midpoint (weight = frequency × 0.5)

Optimal Location = Weighted average of all points
```

**Formula:**
```
Optimal_Lat = Σ(lat_i × weight_i) / Σ(weight_i)
Optimal_Lng = Σ(lng_i × weight_i) / Σ(weight_i)
```

### 2. **K-Means Clustering (Multiple Stations)**

For multiple charging stations, the algorithm uses K-means clustering:

1. Initialize N random cluster centers
2. Assign each route point to nearest cluster
3. Recalculate cluster centers as weighted centroids
4. Repeat until convergence (10 iterations)

---

## How to Use

### Step 1: Add Common Routes

1. Click "Add Route" button
2. Select start location
3. Select end location
4. Set daily frequency (number of trips per day)
5. Click "Add Route"

**Example Routes:**
- Main Gate → Academic Block (20 trips/day)
- Hostel Area → Library (15 trips/day)
- Sports Complex → Cafeteria (10 trips/day)

### Step 2: Choose Number of Stations

Use the slider to select how many charging stations you want to place (1-5).

### Step 3: Find Optimal Location

Click "Find Optimal Location" button.

The algorithm will:
- Calculate the best placement
- Show location on map with purple star marker
- Display metrics in the results panel

---

## Metrics Explained

### Average Distance
- **What**: Mean distance from all routes to the charging station
- **Lower is better**: Shorter average travel distance
- **Formula**: `Σ(distance_i × frequency_i) / Σ(frequency_i)`

### Coverage Percentage
- **What**: Percentage of routes within acceptable distance (500m)
- **Higher is better**: More routes can easily access the station
- **Target**: >80% coverage

### Max Distance
- **What**: Worst-case distance any route has to travel
- **Lower is better**: No user is too far from the station
- **Target**: <1000m

### Daily Trips
- **What**: Total number of charging sessions expected per day
- **Higher = more demand**: Helps size the charging infrastructure

---

## Algorithms Used

### Single Station Optimization

```javascript
function findOptimalLocation(routes) {
  // Step 1: Extract all route points with weights
  points = [];
  for each route:
    points.add({
      start: route.start,
      end: route.end,
      midpoint: midpoint(start, end),
      weight: route.frequency
    });

  // Step 2: Calculate weighted centroid
  optimal_lat = Σ(point.lat × point.weight) / Σ(point.weight);
  optimal_lng = Σ(point.lng × point.weight) / Σ(point.weight);

  return { lat: optimal_lat, lng: optimal_lng };
}
```

### Multiple Stations Optimization

```javascript
function findMultipleLocations(routes, numStations) {
  // K-means clustering
  clusters = initializeRandomClusters(numStations);

  for 10 iterations:
    // Assignment step
    for each point:
      assign to nearest cluster center;

    // Update step
    for each cluster:
      recalculate center as weighted centroid;

  return cluster centers as optimal locations;
}
```

---

## Scoring System

Each location is scored based on three factors:

```
Score = (avgDistScore × 0.4) + (coverageScore × 0.3) + (maxDistScore × 0.3)

Where:
  avgDistScore = max(0, 100 - avgDistance/10)
  coverageScore = coveragePercentage
  maxDistScore = max(0, 100 - maxDistance/15)
```

**Higher score = better location**

---

## Use Cases

### 1. New Campus Planning
- Add all expected routes
- Find optimal location for first charging station
- Saves infrastructure costs

### 2. Expanding Infrastructure
- Add existing stations
- Find optimal location for next station
- Maximizes coverage improvement

### 3. Relocation Analysis
- Compare existing station vs optimal location
- Calculate improvement metrics
- Justify relocation decisions

### 4. Multiple Station Network
- Find 2-5 optimal locations
- Ensure comprehensive campus coverage
- Minimize user travel distance

---

## Example Scenario

### Campus with 3 Common Routes:

```
Route 1: Main Gate → Academic Block (25 trips/day)
Route 2: Hostel → Library (20 trips/day)
Route 3: Sports Complex → Cafeteria (15 trips/day)
```

### Results:

**Optimal Location:** 15.3918°N, 73.8798°E

**Metrics:**
- Average Distance: 180m
- Coverage: 100% (all routes within 500m)
- Max Distance: 285m
- Daily Trips: 60

**Improvement vs Existing:**
- 25% reduction in average distance
- 15% increase in coverage

---

## Visualization on Map

### Legend:

- 🟢 **Green Marker**: Existing charging station
- ⭐ **Purple Star**: Optimal charging station location
- 🔵 **Blue Markers**: Campus locations
- ⚪ **Purple Circle**: Coverage radius (150m) around optimal location

---

## Tips for Best Results

### 1. **Accurate Frequencies**
- Use actual trip data if available
- Estimate peak usage patterns
- Consider morning/evening rush hours

### 2. **Include All Major Routes**
- Don't miss important travel patterns
- Consider both academic and residential routes
- Include cafeteria and sports complex routes

### 3. **Multiple Stations**
- For large campuses, use 2-3 stations
- Ensures no area is underserved
- Balances load across stations

### 4. **Validate Results**
- Check if location is accessible
- Ensure space for parking
- Consider electrical infrastructure

---

## Advanced Features

### Compare Scenarios

Test different configurations:
1. Single station vs multiple stations
2. Different route priorities
3. Existing location vs optimal location

### Improvement Analysis

For existing stations:
```javascript
improvement = {
  distanceReduction: currentAvg - optimalAvg,
  coverageIncrease: optimalCoverage - currentCoverage,
  relocateDistance: distance(current, optimal)
}

if (relocateDistance > 100m) {
  recommend_relocation();
}
```

---

## Mathematical Background

### Facility Location Problem

This is a classic **p-median problem** in operations research:

**Objective:** Minimize total weighted distance

```
Minimize: Σ(frequency_i × distance(route_i, station))
```

**Constraints:**
- Station must be on campus
- Must be accessible by road
- Within budget/feasibility

### Why Weighted Centroid?

The weighted centroid provides:
- ✅ Optimal solution for distance minimization
- ✅ Fast computation (O(n) time)
- ✅ Unique solution (no local minima)
- ✅ Easy to understand and explain

### Why K-Means for Multiple Stations?

K-means clustering provides:
- ✅ Good approximation for p-median problem
- ✅ Fast convergence (10-20 iterations)
- ✅ Balanced station loads
- ✅ Minimizes within-cluster distances

---

## Future Enhancements

- [ ] Add elevation consideration (prefer flat terrain)
- [ ] Include electrical grid proximity
- [ ] Consider existing infrastructure
- [ ] Add budget constraints
- [ ] Real-time demand forecasting
- [ ] Peak hour analysis
- [ ] Seasonal variation
- [ ] Multi-objective optimization

---

## References

### Academic Papers:
- Weber, A. (1909). "Theory of the Location of Industries"
- Hakimi, S.L. (1964). "Optimum Locations of Switching Centers"
- MacQueen, J. (1967). "K-Means Clustering"

### Real-world Applications:
- Amazon warehouse placement
- Fire station location optimization
- EV charging network planning
- Hospital location planning

---

## Code Files

### Core Algorithm:
- `src/utils/chargingStationOptimizer.js` - Optimization algorithms

### UI Component:
- `src/components/OptimalLocationFinder.jsx` - User interface

### Integration:
- `src/App.jsx` - Main app integration
- `src/components/MapView.jsx` - Map visualization

---

Last Updated: November 10, 2025

