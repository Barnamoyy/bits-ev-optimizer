# EV Charging Optimizer - BITS Goa Campus

A web application for optimizing electric vehicle charging schedules based on 3D terrain analysis, route planning, and energy consumption calculations for BITS Goa campus.

## Features

- **Interactive 2D Map**: Visualize the BITS Goa campus with charging station locations and routes using Deck.gl and ArcGIS.
- **3D Terrain Visualization**: View campus elevation contours in an interactive 3D environment.
- **Optimal Charging Station Location Finder**: Find the best locations for new charging stations based on existing routes.
- **Energy Consumption Calculator**: Real-time calculations based on:
  - Distance and route elevation changes
  - Rolling resistance and air drag
  - Regenerative braking on downhill sections
  - Motor efficiency
- **Battery Management**: Track battery levels and predict post-trip battery status.
- **Charging Optimizer**: Automatic recommendations for optimal charging intervals.
- **Route Planner**: Select start and end points to calculate energy requirements using real road data.
- **Elevation Profiles**: Detailed elevation charts showing real terrain variations.

## Technologies Used

- **Frontend Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **2D/3D Mapping**: @deck.gl/arcgis, @deck.gl/react, @deck.gl/core, @deck.gl/layers, @deck.gl/geo-layers
- **Charts**: Recharts
- **Icons**: Lucide React

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
neena-project/
├── src/
│   ├── components/
│   │   ├── MapView.jsx                 # 2D/3D map component using Deck.gl
│   │   ├── Dashboard.jsx               # Main dashboard with stats
│   │   ├── RouteSelector.jsx           # Route selection interface
│   │   ├── ElevationProfile.jsx        # Elevation chart component
│   │   ├── ElevationReport.jsx         # Component to display elevation statistics
│   │   └── OptimalLocationFinder.jsx   # Interface for finding optimal charging station locations
│   ├── data/
│   │   └── campusData.js               # BITS Goa campus location data
│   ├── services/
│   │   ├── routingService.js           # Service for fetching route data
│   │   ├── elevationService.js         # Service for fetching elevation data
│   │   └── roadSnappingService.js      # Service for snapping points to roads
│   ├── utils/
│   │   ├── energyCalculator.js         # Energy consumption algorithms
│   │   └── chargingStationOptimizer.js # Algorithms for finding optimal charging station locations
│   ├── App.jsx                         # Main application component
│   ├── main.jsx                        # Application entry point
│   └── index.css                       # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## How It Works

### Energy Calculation Algorithm

The application calculates energy consumption using physics-based formulas:

1. **Rolling Resistance Energy**: 
   - `E_rr = m × g × C_rr × d`
   - Where m = vehicle mass, g = gravity, C_rr = rolling resistance coefficient, d = distance

2. **Air Resistance Energy**:
   - `E_air = 0.5 × ρ × C_d × A × v² × d`
   - Where ρ = air density, C_d = drag coefficient, A = frontal area, v = velocity

3. **Potential Energy (Uphill)**:
   - `E_uphill = m × g × h`
   - Where h = elevation gain

4. **Regenerative Braking (Downhill)**:
   - `E_regen = m × g × h × η_regen`
   - Where η_regen = regenerative efficiency (typically 70%)

5. **Total Energy**:
   - `E_total = (E_rr + E_air + E_uphill - E_regen) / η_motor`

### Optimal Location Finder

The "Optimal Location Finder" uses a k-means clustering algorithm to identify the best locations for new charging stations. It works by:
1.  Collecting all the routes selected by the user.
2.  Treating each route as a data point.
3.  Running the k-means algorithm to find the center of the clusters of routes.
4.  The center of the largest cluster is the optimal location for a new charging station.

### Charging Optimization

The system recommends charging when:
- Battery level will drop below 20% after a planned trip
- Calculates required charging time based on battery capacity and charging power (7.4 kW Level 2 charger)
- Provides energy requirements in kWh

### Efficiency Rating

Routes are rated based on terrain gradient:
- **Excellent** (< 2% gradient): 95% efficiency
- **Good** (2-4% gradient): 85% efficiency
- **Moderate** (4-6% gradient): 75% efficiency
- **Poor** (6-8% gradient): 65% efficiency
- **Very Poor** (> 8% gradient): 55% efficiency

## Usage

1. **Select Route**: Choose start and end locations from the dropdown menus or use quick route buttons.
2. **View Calculations**: The dashboard shows real-time energy consumption, battery usage, and efficiency ratings.
3. **Adjust Battery Level**: Use the slider in the header to set current battery level.
4. **Find Optimal Location**: Use the "Optimal Location Finder" to identify the best spots for new charging stations.
5. **Analyze Elevation**: View detailed elevation profiles with gain/loss statistics.
6. **Charging Recommendations**: Get automatic alerts when charging is needed.

## Future Enhancements

- [ ] Multiple charging station support
- [ ] Real-time traffic integration
- [ ] Historical energy usage tracking
- [ ] Weather-based calculations (temperature effects on battery)
- [ ] Multi-trip daily planning
- [ ] Integration with actual EV APIs
- [ ] Mobile app version
- [ ] Real campus elevation data (DEM/SRTM)
- [ ] Integration with ArcGIS services for more advanced geospatial analysis

## Vehicle Parameters (Default)

- Battery Capacity: 60 kWh
- Vehicle Mass: 1800 kg
- Motor Efficiency: 90%
- Regenerative Efficiency: 70%
- Average Speed: 40 km/h (campus speed)
- Drag Coefficient: 0.28
- Frontal Area: 2.3 m²

## License

This project is for educational purposes as part of the BITS Goa coursework.

## Contributors

Developed for BITS Goa campus EV charging optimization.