'use client';

/**
 * Scene.tsx
 * Sets up the React Three Fiber <Canvas> and wires together all 3-D objects.
 *
 * Architecture
 * ─────────────────────────────────────────────────────────────
 *  <Scene>
 *    └─ <Canvas>
 *         ├─ <SceneContent>       ← inner client component that can use R3F hooks
 *         │    ├─ Stars           ← drei star-field background
 *         │    ├─ Lights
 *         │    ├─ <group>         ← earthGroupRef  (rotates Earth + Markers together)
 *         │    │    ├─ <Earth>
 *         │    │    └─ <Markers>
 *         │    └─ (cloud mesh lives inside Earth but rotates independently)
 *         └─ Suspense fallback while textures load
 *
 * After mount the component calls props.onReady() with all refs the
 * AnimationTimeline needs (camera, earthGroup, markersGroup, autoRotate).
 */

import { Suspense, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import Earth, { type EarthHandle } from './Earth';
import Markers from './Markers';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SceneControls {
  camera:       THREE.PerspectiveCamera;
  earthGroup:   THREE.Group;
  markersGroup: THREE.Group;
  autoRotate:   React.MutableRefObject<boolean>;
}

interface SceneProps {
  onReady: (controls: SceneControls) => void;
}

// ─── Inner component (accesses R3F context) ───────────────────────────────────
interface SceneContentProps {
  earthGroupRef:   React.RefObject<THREE.Group | null>;
  markersGroupRef: React.RefObject<THREE.Group | null>;
  earthRef:        React.RefObject<EarthHandle | null>;
  autoRotateRef:   React.MutableRefObject<boolean>;
  onReady:         (controls: SceneControls) => void;
}

function SceneContent({
  earthGroupRef,
  markersGroupRef,
  earthRef,
  autoRotateRef,
  onReady,
}: SceneContentProps) {
  const { camera } = useThree();

  // Bridge camera ref to parent once on mount
  useEffect(() => {
    if (earthGroupRef.current && markersGroupRef.current) {
      onReady({
        camera:       camera as THREE.PerspectiveCamera,
        earthGroup:   earthGroupRef.current,
        markersGroup: markersGroupRef.current,
        autoRotate:   autoRotateRef,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drive Earth group rotation (and cloud mesh via earthRef) every frame.
  // GSAP sets autoRotateRef.current = false to take over before the zoom.
  useFrame((_, delta) => {
    if (!autoRotateRef.current) return;
    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <>
      {/* Deep-space background colour */}
      <color attach="background" args={['#00000a']} />

      {/* Star field */}
      <Stars
        radius={300}
        depth={60}
        count={typeof window !== 'undefined' && window.innerWidth < 768 ? 3000 : 6000}
        factor={7}
        saturation={0}
        fade
        speed={0.4}
      />

      {/* Sunlight – key light from the side to give the globe depth */}
      <directionalLight
        position={[5, 3, 5]}
        intensity={1.5}
        color="#fffaed"
      />
      {/* Faint fill from the opposite side – simulates earthshine */}
      <ambientLight intensity={0.08} />
      <pointLight position={[-8, -4, -6]} intensity={0.25} color="#112244" />

      {/* Earth + Markers share one group so they rotate together */}
      <group ref={earthGroupRef as React.RefObject<THREE.Group>}>
        <Suspense fallback={null}>
          <Earth ref={earthRef as React.RefObject<EarthHandle>} autoRotateRef={autoRotateRef} />
        </Suspense>
        <Markers ref={markersGroupRef as React.RefObject<THREE.Group>} />
      </group>
    </>
  );
}

// ─── Scene (exported, dynamically imported with ssr:false in page.tsx) ────────
const Scene = forwardRef<SceneControls, SceneProps>(({ onReady }, _ref) => {
  const earthGroupRef   = useRef<THREE.Group>(null);
  const markersGroupRef = useRef<THREE.Group>(null);
  const earthRef        = useRef<EarthHandle>(null);
  const autoRotateRef   = useRef(true);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <Canvas
      camera={{ position: [0, 0, isMobile ? 3.2 : 4], fov: isMobile ? 60 : 45, near: 0.1, far: 1000 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, isMobile ? 1.5 : 2]}
      style={{ width: '100%', height: '100%' }}
    >
      <SceneContent
        earthGroupRef={earthGroupRef}
        markersGroupRef={markersGroupRef}
        earthRef={earthRef}
        autoRotateRef={autoRotateRef}
        onReady={onReady}
      />
    </Canvas>
  );
});

Scene.displayName = 'Scene';
export default Scene;
