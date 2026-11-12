export const CENTRE_COORDINATES = {
  latitude: 21.3250054,
  longitude: 71.0246248,
  dmsLabel: '21°19\'30.0"N 71°01\'28.7"E',
  plusCode: "82GF+2V2 Dhari, Gujarat",
  mapsUrl: "https://maps.app.goo.gl/wjBLiaZDNBHhgyZY6",
} as const;

export const GEOFENCE_RADIUS_METERS = 200;

const EARTH_RADIUS_METERS = 6371000;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Computes great-circle distance in meters between two WGS84 coordinates.
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const rLat1 = toRadians(lat1);
  const rLat2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_METERS * c);
}

/**
 * Returns compass bearing in radians (0 = north/up, clockwise positive)
 * from (fromLat, fromLon) toward (toLat, toLon).
 */
export function calculateBearingRadians(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): number {
  const y = Math.sin(toRadians(toLon - fromLon)) * Math.cos(toRadians(toLat));
  const x =
    Math.cos(toRadians(fromLat)) * Math.sin(toRadians(toLat)) -
    Math.sin(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.cos(toRadians(toLon - fromLon));
  return Math.atan2(y, x);
}

export function isWithinGeofence(
  distanceMeters: number,
  radiusMeters: number = GEOFENCE_RADIUS_METERS
): boolean {
  return distanceMeters <= radiusMeters;
}

export function formatDistanceMeters(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

