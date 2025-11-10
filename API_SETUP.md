# API Setup and Configuration

This document explains how the application fetches real road routes and elevation data.

---

## Overview

The application now uses **TWO external APIs** to provide accurate route calculations:

1. **Routing API** - Gets actual road paths (not straight lines)
2. **Elevation API** - Fetches real elevation data for the route

---

## 1. Routing APIs

### Primary: OSRM (Open Source Routing Machine)

**URL**: `https://router.project-osrm.org`

**Features**:
- ✅ **FREE** - No API key required
- ✅ Actual road routes
- ✅ Accurate distances
- ✅ Fast response times
- ✅ No rate limits for reasonable use

**How it works**:
```javascript
const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
```

**Response includes**:
- Complete road path coordinates
- Total distance (meters)
- Estimated duration (seconds)
- Turn-by-turn geometry

### Fallback: OpenRouteService (ORS)

**URL**: `https://api.openrouteservice.org`

**Features**:
- ✅ More routing options
- ⚠️ Requires API key (free tier available)
- ⚠️ Rate limited: 2000 requests/day (free tier)

**Setup** (if needed):
1. Sign up at https://openrouteservice.org/dev/#/signup
2. Get your API key
3. Replace in `src/services/routingService.js`:
   ```javascript
   const ORS_API_KEY = 'YOUR_API_KEY_HERE';
   ```

---

## 2. Elevation API

### Open Elevation API

**URL**: `https://api.open-elevation.com`

**Features**:
- ✅ **FREE** - No API key required
- ✅ Global coverage
- ✅ Batch requests (up to 100 points)
- ⚠️ Moderate accuracy (~10-30m error)
- ⚠️ Slower response times

**How it works**:
```javascript
const url = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`;
```

**Data source**: SRTM (Shuttle Radar Topography Mission) 90m resolution

**Accuracy for BITS Goa**:
- Horizontal: ±10 meters
- Vertical: ±10-30 meters
- Good enough for energy calculations

---

## 3. How the System Works

### Step-by-Step Process:

```
1. User selects start and end locations
   ↓
2. ROUTING API: Fetch actual road path
   - Returns ~100-500 coordinate points
   - Provides exact road distance
   ↓
3. SIMPLIFY: Reduce to ~50 points
   - Saves API calls
   - Maintains accuracy
   ↓
4. ELEVATION API: Batch fetch elevations
   - Gets real elevation for each point
   - Returns elevation in meters
   ↓
5. CALCULATE: Energy consumption
   - Uses actual road distance
   - Uses real elevation gains/losses
   - Shows accurate results
   ↓
6. DISPLAY: Show on map and charts
   - Route follows actual roads
   - Elevation profile shows real terrain
```

---

## 4. Network Requirements

The application needs **internet access** to fetch:
- Road routes from OSRM/ORS
- Elevation data from Open Elevation API

### Running the Development Server:

```bash
npm run dev
```

The Vite dev server needs network access. If you see CORS errors, they should be handled by the APIs (both OSRM and Open Elevation support CORS).

---

## 5. API Rate Limits

### OSRM (Primary)
- **Rate Limit**: Reasonable use policy
- **Typical**: ~60 requests/minute acceptable
- **Campus use**: Well within limits

### Open Elevation API
- **Rate Limit**: No strict limit
- **Recommendation**: Max 1-2 requests/second
- **Batch support**: Up to 100 points per request

### Current Implementation
- Simplifies routes to ~50 points
- Batches elevation requests
- Total: ~1-2 API calls per route calculation
- **Result**: Very minimal API usage

---

## 6. Offline Fallback

If APIs are unavailable, the system falls back to:

1. **Routing**: Straight line between points
2. **Elevation**: Estimated values (185m default)
3. **Warning**: Displayed to user

---

## 7. Alternative APIs (If Needed)

### For Better Accuracy:

#### Google Maps APIs (Paid, but very accurate)

**Directions API** (routing):
```javascript
const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLat},${startLng}&destination=${endLat},${endLng}&key=YOUR_API_KEY`;
```

**Elevation API**:
```javascript
const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lng}&key=YOUR_API_KEY`;
```

**Costs**:
- Directions: $5 per 1000 requests (after free $200 credit)
- Elevation: $5 per 1000 requests

**Accuracy**:
- Routing: Very accurate, includes real-time traffic
- Elevation: ±1-5 meters

#### Mapbox APIs (Good middle ground)

**Directions API**:
```javascript
const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?access_token=YOUR_TOKEN`;
```

**Costs**:
- 100,000 free requests/month
- $0.50 per 1000 after that

---

## 8. Improving Elevation Accuracy

### Option 1: Use Local DEM Files

Download SRTM or ASTER DEM tiles for Goa region:
- **Source**: https://earthexplorer.usgs.gov/
- **Resolution**: 30m or 90m
- **Accuracy**: ±10m vertical
- **Advantage**: Offline, faster, free
- **Disadvantage**: Requires processing and storage

### Option 2: On-Campus Survey

Best accuracy for BITS Goa:
1. Use GPS devices with barometric altimeters
2. Record elevation at key points
3. Store in database
4. Interpolate between points

**Accuracy**: <1 meter

---

## 9. Current Performance

### Typical Route Calculation:

```
Time Breakdown:
- Routing API: 200-500ms
- Elevation API: 500-1500ms
- Calculations: <10ms
- Total: ~1-2 seconds

Data Usage:
- Routing response: ~5-20 KB
- Elevation response: ~2-5 KB
- Total per route: ~10-25 KB
```

### For 100 Routes/Day:
- API calls: ~200
- Data transfer: ~2.5 MB
- Cost: $0 (all free APIs)

---

## 10. Troubleshooting

### Error: "Failed to fetch route"
**Cause**: Network issue or API down
**Solution**: 
- Check internet connection
- Wait a few seconds and retry
- System will use straight-line fallback

### Error: "CORS policy"
**Cause**: Browser security restriction
**Solution**: 
- Both OSRM and Open Elevation support CORS
- Should work automatically
- If persistent, try different browser

### Slow response times
**Cause**: API server load
**Solution**:
- Open Elevation can be slow (10-30 seconds)
- This is normal, be patient
- Shows loading indicator to user

### Inaccurate elevations
**Cause**: Open Elevation uses 90m resolution data
**Solution**:
- Expected for free API
- Consider upgrading to Google Elevation API
- Or use local DEM files

---

## 11. Configuration Files

### `src/services/routingService.js`
```javascript
// Configure routing API
const ORS_API_KEY = 'your_key_here'; // Optional
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';
```

### `src/services/elevationService.js`
```javascript
// Configure elevation API
const OPEN_ELEVATION_API = 'https://api.open-elevation.com/api/v1/lookup';
```

---

## 12. Security Notes

- No API keys are stored in code (OSRM requires none)
- All requests are client-side (no server needed)
- No user data is sent to APIs
- Only coordinates are transmitted
- HTTPS used for all requests

---

## 13. Future Enhancements

- [ ] Cache routes for repeated calculations
- [ ] Add route alternatives (shortest vs fastest)
- [ ] Support for walking/cycling routes
- [ ] Real-time traffic integration
- [ ] Offline mode with cached routes
- [ ] Custom routing preferences (avoid hills, etc.)

---

Last Updated: November 10, 2025

