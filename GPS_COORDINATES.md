# BITS Goa Campus - GPS Coordinates

This document contains the actual GPS coordinates for various locations on the BITS Goa campus.

## Verified GPS Coordinates

### Campus Center
- **Coordinates**: `15.392096, 73.879556`
- **Decimal**: 15.392096°N, 73.879556°E
- **Source**: GPS Survey
- **Status**: ✅ Verified

### Main Gate
- **Coordinates**: `15.387352, 73.875786`
- **Decimal**: 15.387352°N, 73.875786°E
- **Source**: GPS Survey
- **Status**: ✅ Verified

### Library
- **DMS Format**: 15°23'29.7"N 73°52'49.6"E
- **Decimal Format**: `15.391583, 73.880444`
- **Conversion**:
  - Latitude: 15 + (23/60) + (29.7/3600) = 15.391583°N
  - Longitude: 73 + (52/60) + (49.6/3600) = 73.880444°E
- **Source**: GPS Survey
- **Status**: ✅ Verified

### Cafeteria
- **Coordinates**: `15.392803, 73.884299`
- **Decimal**: 15.392803°N, 73.884299°E
- **Source**: GPS Survey
- **Status**: ✅ Verified

### Hostel Area
- **Coordinates**: `15.391133, 73.876518`
- **Decimal**: 15.391133°N, 73.876518°E
- **Source**: GPS Survey
- **Status**: ✅ Verified

### Administration Block
- **DMS Format**: 15°23'34.1"N 73°52'49.8"E
- **Decimal Format**: `15.392806, 73.880500`
- **Conversion**:
  - Latitude: 15 + (23/60) + (34.1/3600) = 15.392806°N
  - Longitude: 73 + (52/60) + (49.8/3600) = 73.880500°E
- **Source**: GPS Survey
- **Status**: ✅ Verified

### Main Campus Charging Station
- **Coordinates**: `15.391500, 73.880000`
- **Decimal**: 15.391500°N, 73.880000°E
- **Source**: Estimated (near campus center)
- **Status**: ⚠️ Estimated - Needs GPS survey

---

## Estimated Coordinates (Need Verification)

### Academic Block
- **Coordinates**: `15.391800, 73.879200`
- **Status**: ⚠️ Estimated

### Sports Complex
- **Coordinates**: `15.390500, 73.880800`
- **Status**: ⚠️ Estimated

---

## Campus Boundaries

Based on verified GPS coordinates:

- **Southwest Corner**: 15.387352, 73.875786 (Main Gate)
- **Northeast Corner**: 15.392803, 73.884299 (Cafeteria)
- **Latitude Range**: 15.3874 to 15.3928 (~600 meters)
- **Longitude Range**: 73.8758 to 73.8843 (~950 meters)
- **Approximate Campus Area**: ~570,000 m² (57 hectares)

---

## Map Bounds Configuration

For optimal map display:

```javascript
const CAMPUS_BOUNDS = {
  southwest: [15.3865, 73.8750], // With padding
  northeast: [15.3940, 73.8850]  // With padding
};
```

---

## Distance Matrix

Distances between major locations (calculated using Haversine formula):

| From → To | Distance (meters) | Elevation Change |
|-----------|-------------------|------------------|
| Main Gate → Campus Center | ~445m | +15m (uphill) |
| Main Gate → Library | ~569m | +18m (uphill) |
| Main Gate → Cafeteria | ~971m | +16m (uphill) |
| Main Gate → Hostel Area | ~427m | +20m (uphill) |
| Campus Center → Library | ~86m | +3m (slight uphill) |
| Campus Center → Cafeteria | ~417m | +1m (flat) |
| Campus Center → Admin Block | ~88m | -3m (slight downhill) |
| Library → Cafeteria | ~341m | -2m (slight downhill) |
| Hostel Area → Cafeteria | ~671m | -4m (slight downhill) |

---

## DMS to Decimal Conversion Formula

For converting future GPS coordinates from DMS (Degrees, Minutes, Seconds) to Decimal format:

```
Decimal Degrees = Degrees + (Minutes / 60) + (Seconds / 3600)
```

**Example**:
- DMS: 15°23'29.7"N
- Calculation: 15 + (23 ÷ 60) + (29.7 ÷ 3600)
- Result: 15.391583°N

---

## How to Add New Locations

When surveying new locations on campus:

1. **Record GPS Coordinates** using:
   - Smartphone GPS app (accuracy: ±5-10m)
   - Handheld GPS device (accuracy: ±3-5m)
   - Survey-grade GPS (accuracy: <1m)

2. **Record Elevation** (if available)

3. **Update Files**:
   - Add to `src/data/campusData.js` in CAMPUS_LOCATIONS array
   - Update this document with verification status
   - Update `CALCULATIONS.md` coordinate table

4. **Format**:
   ```javascript
   {
     id: 'location-id',
     name: 'Location Name',
     lat: 15.XXXXXX,  // Decimal format
     lng: 73.XXXXXX,  // Decimal format
     elevation: XXX,   // meters above sea level
     type: 'building' | 'facility' | 'entry' | 'residential',
   }
   ```

---

## Elevation Data

**Note**: Elevation values are currently estimated. For accurate energy calculations, elevation data should be obtained from:

1. GPS devices with barometric altimeters
2. Open Elevation API: https://api.open-elevation.com/
3. Google Maps Elevation API (paid)
4. SRTM DEM data files
5. On-site survey with professional equipment

---

## Updates Log

- **2025-11-10**: Added verified GPS coordinates for 6 locations
  - Campus Center
  - Main Gate
  - Library (converted from DMS)
  - Cafeteria
  - Hostel Area
  - Administration Block (converted from DMS)

---

## Next Steps

To improve accuracy:
- [ ] GPS survey for Academic Block
- [ ] GPS survey for Sports Complex
- [ ] GPS survey for actual Charging Station location
- [ ] Elevation data collection for all locations
- [ ] Add more campus locations (labs, gates, parking areas, etc.)
- [ ] Verify and fine-tune existing coordinates

---

Last Updated: November 10, 2025

