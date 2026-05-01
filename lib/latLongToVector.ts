import * as THREE from 'three';

/**
 * Converts geographic latitude/longitude to a 3D point on a sphere.
 *
 * How it works:
 *   phi   = polar angle measured from the Y axis (0° at north pole, 180° at south pole)
 *   theta = azimuthal angle around the Y axis (longitude mapped to 0–2π)
 *
 * Standard spherical-to-cartesian conversion:
 *   x = r · sin(phi) · cos(theta)
 *   y = r · cos(phi)
 *   z = r · sin(phi) · sin(theta)
 *
 * The negative x accounts for Three.js using a right-handed coordinate system
 * where the prime meridian (lon 0°) faces the +Z axis when rotation.y = 0.
 */
export function latLongToVector3(
  lat: number,   // degrees, -90 (south pole) to +90 (north pole)
  lon: number,   // degrees, -180 to +180
  radius = 1     // sphere radius
): THREE.Vector3 {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
     (radius * Math.cos(phi)),
     (radius * Math.sin(phi) * Math.sin(theta))
  );
}
