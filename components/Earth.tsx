'use client';

/**
 * Earth.tsx
 * Renders three concentric spheres:
 *   1. Earth  – textured with NASA's Blue Marble day map + a specular highlight
 *   2. Clouds – semi-transparent cloud layer that rotates slightly faster
 *   3. Atmosphere – custom GLSL shader creating a blue rim-glow effect
 */

import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

// ─── Atmosphere shader ────────────────────────────────────────────────────────
// Vertex shader: passes the surface normal in view space to the fragment stage.
const atmosphereVert = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader: creates a bright rim that fades to nothing at the center.
// The dot product of the view-space normal with (0,0,1) tells us how
// "edge-on" each fragment is – edges have a small dot, center has a large dot.
// We subtract from 0.7 so the center goes dark and clamp negatives to 0.
const atmosphereFrag = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    float rim = max(0.0, 0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)));
    float intensity = pow(rim, 3.2);
    gl_FragColor = vec4(0.28, 0.58, 1.0, 1.0) * intensity;
  }
`;

// ─── Earth component ──────────────────────────────────────────────────────────
export interface EarthHandle {
  cloudMesh: THREE.Mesh | null;
}

interface EarthProps {
  autoRotateRef: React.MutableRefObject<boolean>;
}

/**
 * forwardRef lets the parent (Scene) attach a ref to EarthHandle so it can
 * access the cloud mesh for independent rotation inside GSAP's zoom phase.
 */
const Earth = forwardRef<EarthHandle, EarthProps>(({ autoRotateRef }, ref) => {
  const cloudRef = useRef<THREE.Mesh>(null);

  // Expose the cloud mesh ref upward
  useImperativeHandle(ref, () => ({
    get cloudMesh() { return cloudRef.current; },
  }));

  // Load both textures in one call; Suspense pauses rendering until both arrive
  const [dayMap, cloudsMap] = useTexture([
    '/textures/earth_daymap.jpg',
    '/textures/earth_clouds.png',
  ]);

  // Build atmosphere material once (memoised to avoid recreation on re-render)
  const atmosphereMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader:   atmosphereVert,
        fragmentShader: atmosphereFrag,
        blending:   THREE.AdditiveBlending,
        side:        THREE.FrontSide,
        transparent: true,
        depthWrite:  false,
      }),
    []
  );

  // Clouds rotate slightly faster than Earth (they are NOT inside the earth group,
  // so they have an independent rotation that Scene.tsx's useFrame drives).
  useFrame((_, delta) => {
    if (!autoRotateRef.current) return;
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.062; // slightly faster than Earth (0.05)
    }
  });

  return (
    <>
      {/* ── 1. Earth sphere ── */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={dayMap}
          shininess={8}
          specular={new THREE.Color(0x224466)}
        />
      </mesh>

      {/* ── 2. Cloud layer (sits just above the surface) ── */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[1.006, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.38}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </mesh>

      {/* ── 3. Atmosphere glow shell ── */}
      <mesh renderOrder={10}>
        <sphereGeometry args={[1.16, 64, 64]} />
        <primitive object={atmosphereMat} attach="material" />
      </mesh>
    </>
  );
});

Earth.displayName = 'Earth';
export default Earth;
