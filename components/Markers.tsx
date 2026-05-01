'use client';

/**
 * Markers.tsx — Sci-fi location beacons on the Earth surface.
 *
 * Each marker = 3 layers stacked:
 *   1. Core dot     — bright white sphere, always visible
 *   2. Beam spike   — thin tapered cylinder pointing radially outward (flickers)
 *   3. Expanding rings — two sonar/radar rings that grow and fade on loop,
 *                        offset by half a cycle to keep one always visible
 *
 * All ring/beam materials use AdditiveBlending so they ADD light to whatever
 * is underneath — this creates the natural neon glow look on dark surfaces.
 *
 * Markers are hidden (visible=false) on mount.
 * AnimationTimeline reveals them with staggered opacity tweens.
 */

import { useRef, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { latLongToVector3 } from '@/lib/latLongToVector';

// ─── Marker locations ─────────────────────────────────────────────────────────
// To add a city: append { id, lat, lon, label, isTarget: false }
export const WORLD_MARKERS = [
  { id: 'nigeria',   lat:  6.52,  lon:   3.38, label: 'Lagos, Nigeria',     isTarget: true  },
  { id: 'london',    lat: 51.50,  lon:  -0.12, label: 'London, UK',         isTarget: false },
  { id: 'newyork',   lat: 40.71,  lon: -74.00, label: 'New York, USA',      isTarget: false },
  { id: 'sf',        lat: 37.77,  lon: -122.4, label: 'San Francisco',      isTarget: false },
  { id: 'tokyo',     lat: 35.68,  lon: 139.69, label: 'Tokyo, Japan',       isTarget: false },
  { id: 'berlin',    lat: 52.52,  lon:  13.40, label: 'Berlin, Germany',    isTarget: false },
  { id: 'saopaulo',  lat: -23.55, lon: -46.63, label: 'São Paulo, Brazil',  isTarget: false },
  { id: 'bangalore', lat: 12.97,  lon:  77.59, label: 'Bangalore, India',   isTarget: false },
  { id: 'sydney',    lat: -33.87, lon: 151.21, label: 'Sydney, Australia',  isTarget: false },
  { id: 'nairobi',   lat:  -1.29, lon:  36.82, label: 'Nairobi, Kenya',     isTarget: false },
  { id: 'toronto',   lat: 43.65,  lon: -79.38, label: 'Toronto, Canada',    isTarget: false },
  { id: 'singapore', lat:   1.35, lon: 103.82, label: 'Singapore',          isTarget: false },
];

// ─── Single marker component ──────────────────────────────────────────────────
interface MarkerProps {
  lat: number;
  lon: number;
  isTarget: boolean;
  phaseOffset: number; // so markers don't all pulse in sync
}

function Marker({ lat, lon, isTarget, phaseOffset }: MarkerProps) {
  // Ring refs — two rings per marker, each with a Material ref
  const ring1MeshRef = useRef<THREE.Mesh>(null);
  const ring1MatRef  = useRef<THREE.MeshBasicMaterial>(null);
  const ring2MeshRef = useRef<THREE.Mesh>(null);
  const ring2MatRef  = useRef<THREE.MeshBasicMaterial>(null);
  const beamMatRef   = useRef<THREE.MeshBasicMaterial>(null);

  // Sci-fi colour palette
  const coreColor  = '#ffffff';
  const ringColor  = isTarget ? '#ffcc00' : '#00e8ff';   // gold vs cyan
  const beamColor  = isTarget ? '#ff9900' : '#0099ff';

  // Pulse / expand animation running every frame
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phaseOffset;

    // ── Ring 1: sonar expand ──────────────────────────────────────────────
    const CYCLE = 2.4; // seconds per full expand cycle
    const c1 = (t % CYCLE) / CYCLE;                 // 0 → 1
    if (ring1MeshRef.current) ring1MeshRef.current.scale.setScalar(1 + c1 * 3.0);
    if (ring1MatRef.current)  ring1MatRef.current.opacity = (1 - c1) * 0.9;

    // ── Ring 2: same, offset by half cycle so one ring is always active ───
    const c2 = ((t + CYCLE / 2) % CYCLE) / CYCLE;
    if (ring2MeshRef.current) ring2MeshRef.current.scale.setScalar(1 + c2 * 3.0);
    if (ring2MatRef.current)  ring2MatRef.current.opacity = (1 - c2) * 0.9;

    // ── Beam: flickering intensity ────────────────────────────────────────
    if (beamMatRef.current) {
      beamMatRef.current.opacity = 0.55 + Math.sin(t * 6.0 + phaseOffset) * 0.3;
    }
  });

  // 3-D position on the sphere (slightly above surface so it clears the mesh)
  const pos = latLongToVector3(lat, lon, 1.013);

  // Orient the group so local +Y points radially outward from the globe.
  // Everything inside is built along +Y → beam spikes outward, rings lie flat.
  const normal = pos.clone().normalize();
  const up     = new THREE.Vector3(0, 1, 0);
  const quat   = new THREE.Quaternion().setFromUnitVectors(up, normal);

  const coreSize = isTarget ? 0.018 : 0.012;

  return (
    <group position={pos} quaternion={quat} visible={false} userData={{ isTarget }}>

      {/* ── Beam spike (local +Y = outward from surface) ── */}
      <mesh position={[0, 0.045, 0]}>
        {/* args: [radiusTop, radiusBottom, height, radialSegments] */}
        <cylinderGeometry args={[0.0008, 0.003, 0.09, 5]} />
        <meshBasicMaterial
          ref={beamMatRef}
          color={beamColor}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          userData={{ baseOpacity: 0.7 }}
        />
      </mesh>

      {/* ── Core dot ── */}
      <mesh>
        <sphereGeometry args={[coreSize, 12, 12]} />
        <meshBasicMaterial
          color={coreColor}
          userData={{ baseOpacity: 1 }}
        />
      </mesh>

      {/* ── Ring 1 (flat in local XZ plane = tangent to sphere surface) ── */}
      <mesh ref={ring1MeshRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[coreSize * 1.1, coreSize * 1.7, 48]} />
        <meshBasicMaterial
          ref={ring1MatRef}
          color={ringColor}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          userData={{ baseOpacity: 0.9 }}
        />
      </mesh>

      {/* ── Ring 2 (same geometry, offset phase via useFrame) ── */}
      <mesh ref={ring2MeshRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[coreSize * 1.1, coreSize * 1.7, 48]} />
        <meshBasicMaterial
          ref={ring2MatRef}
          color={ringColor}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          userData={{ baseOpacity: 0.5 }}
        />
      </mesh>

    </group>
  );
}

// ─── Markers group ────────────────────────────────────────────────────────────
const Markers = forwardRef<THREE.Group>((_, ref) => (
  <group ref={ref}>
    {WORLD_MARKERS.map((m, i) => (
      <Marker
        key={m.id}
        lat={m.lat}
        lon={m.lon}
        isTarget={m.isTarget}
        phaseOffset={i * 0.6}
      />
    ))}
  </group>
));

Markers.displayName = 'Markers';
export default Markers;
