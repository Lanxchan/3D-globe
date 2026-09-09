import * as THREE from "three";

export const EARTH_RADIUS = 1;
export const DEFAULT_CAMERA_DISTANCE = 2.82;
export const FOCUS_CAMERA_DISTANCE = 2.18;
export const SUN_DIRECTION = new THREE.Vector3(0.72, 0.28, 0.63).normalize();

/** Equirectangular maps: u=0 at lon −180. Matches NASA / three-globe textures. */
export function latLngToVector3(lat: number, lng: number, radius = EARTH_RADIUS) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

export function vector3ToLatLng(vector: THREE.Vector3) {
  const radius = vector.length() || 1;
  const lat = 90 - (Math.acos(THREE.MathUtils.clamp(vector.y / radius, -1, 1)) * 180) / Math.PI;
  let lng = (Math.atan2(vector.z, -vector.x) * 180) / Math.PI;
  if (lng > 180) lng -= 360;
  if (lng < -180) lng += 360;
  return { lat, lng };
}

export function formatLat(lat: number) {
  return `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? "N" : "S"}`;
}

export function formatLng(lng: number) {
  return `${Math.abs(lng).toFixed(1)}°${lng >= 0 ? "E" : "W"}`;
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function lerpSpherical(from: THREE.Spherical, to: THREE.Spherical, t: number, out: THREE.Spherical) {
  let deltaTheta = to.theta - from.theta;
  while (deltaTheta > Math.PI) deltaTheta -= Math.PI * 2;
  while (deltaTheta < -Math.PI) deltaTheta += Math.PI * 2;
  out.radius = from.radius + (to.radius - from.radius) * t;
  out.phi = from.phi + (to.phi - from.phi) * t;
  out.theta = from.theta + deltaTheta * t;
  return out;
}
