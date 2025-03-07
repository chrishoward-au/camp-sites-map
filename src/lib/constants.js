/**
 * Map default configuration
 */
export const MAP_DEFAULTS = {
  LAT: -36.114858138524454,
  LNG: 146.8884086608887,
  ZOOM_LEVEL: 10,
  STYLE: 'mapbox://styles/mapbox/streets-v12'
};

/**
 * Map styles
 */
export const MAP_STYLES = {
  STREETS: 'mapbox://styles/mapbox/streets-v12',
  SATELLITE: 'mapbox://styles/mapbox/satellite-streets-v12',
  OUTDOORS: 'mapbox://styles/mapbox/outdoors-v12',
  DARK: 'mapbox://styles/mapbox/dark-v11',
  LIGHT: 'mapbox://styles/mapbox/light-v11'
};

/**
 * Travel modes for routing
 */
export const TRAVEL_MODES = {
  FOOT: 'foot',
  BIKE: 'bike',
  CAR: 'car'
};

/**
 * Mapbox profile mapping for different travel modes
 */
export const MAPBOX_PROFILES = {
  [TRAVEL_MODES.FOOT]: 'walking',
  [TRAVEL_MODES.BIKE]: 'cycling',
  [TRAVEL_MODES.CAR]: 'driving'
};

/**
 * Marker colors
 */
export const MARKER_COLORS = {
  DEFAULT: 'oklch(0.685 0.169 237.323)', // Blue
  START: 'oklch(0.723 0.219 149.579)',    // Green
  END: 'oklch(0.637 0.237 25.331)'        // Orange
};

/**
 * Geolocation options
 */
export const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

/**
 * Minimum zoom level required to add a camp site
 */
export const MIN_ZOOM_TO_ADD_SITE = 14;