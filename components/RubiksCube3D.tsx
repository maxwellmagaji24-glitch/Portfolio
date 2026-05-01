'use client';

/**
 * RubiksCube3D.tsx — Rotating Rubik's cube in blue shades.
 *
 * The cube continuously rotates and periodically "scrambles" and "solves" itself
 * using GSAP animations on the cube's rotation axes.
 *
 * Rendered using Three.js + React Three Fiber with dynamic import (ssr: false).
 */

import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// ── Color palette: Blue shades ──────────────────────────────────────────────
const BLUE_SHADES = {
  light:   '#4a90e2', // light blue
  sky:     '#3498db', // sky blue
  steel:   '#2c5aa0', // steel blue
  navy:    '#1a3a52', // navy
  indigo:  '#3d5a80', // indigo
  cyan:    '#5dade2', // cyan
};

type ColorKey = keyof typeof BLUE_SHADES;
const FACE_COLORS: ColorKey[] = ['light', 'sky', 'steel', 'navy', 'indigo', 'cyan'];

// ── Cubelet size and spacing ───────────────────────────────────────────────
const CUBELET_SIZE = 0.28;
const GAP = 0.002;
const CUBE_SCALE = 1.2;

// ── Single cubelet (part of the Rubik's cube) ──────────────────────────────
function Cubelet({
  position,
  faceColors,
}: {
  position: [number, number, number];
  faceColors: Record<string, string>;
}) {
  const meshRef = useRef<THREE.Group>(null);

  return (
    <group ref={meshRef} position={position}>
      {/* Each face is a separate plane so we can color them individually */}
      {/* Front (Z+) */}
      <mesh position={[0, 0, CUBELET_SIZE / 2]}>
        <planeGeometry args={[CUBELET_SIZE * 0.95, CUBELET_SIZE * 0.95]} />
        <meshBasicMaterial color={faceColors.front} />
      </mesh>

      {/* Back (Z-) */}
      <mesh position={[0, 0, -CUBELET_SIZE / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[CUBELET_SIZE * 0.95, CUBELET_SIZE * 0.95]} />
        <meshBasicMaterial color={faceColors.back} />
      </mesh>

      {/* Right (X+) */}
      <mesh position={[CUBELET_SIZE / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[CUBELET_SIZE * 0.95, CUBELET_SIZE * 0.95]} />
        <meshBasicMaterial color={faceColors.right} />
      </mesh>

      {/* Left (X-) */}
      <mesh position={[-CUBELET_SIZE / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[CUBELET_SIZE * 0.95, CUBELET_SIZE * 0.95]} />
        <meshBasicMaterial color={faceColors.left} />
      </mesh>

      {/* Top (Y+) */}
      <mesh position={[0, CUBELET_SIZE / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CUBELET_SIZE * 0.95, CUBELET_SIZE * 0.95]} />
        <meshBasicMaterial color={faceColors.top} />
      </mesh>

      {/* Bottom (Y-) */}
      <mesh position={[0, -CUBELET_SIZE / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CUBELET_SIZE * 0.95, CUBELET_SIZE * 0.95]} />
        <meshBasicMaterial color={faceColors.bottom} />
      </mesh>

      {/* Dark outline cube to define edges */}
      <mesh>
        <boxGeometry args={[CUBELET_SIZE * 0.98, CUBELET_SIZE * 0.98, CUBELET_SIZE * 0.98]} />
        <meshBasicMaterial color="#111111" wireframe />
      </mesh>
    </group>
  );
}

// ── Main cube group ──────────────────────────────────────────────────────────
function CubeGroup() {
  const cubeRef = useRef<THREE.Group>(null);

  // Rotation state for continuous spin
  const rotState = useRef({ x: 0, y: 0, z: 0 });
  const targetRot = useRef({ x: 0, y: 0, z: 0 });
  const mouseRot = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (!cubeRef.current) return;

    // Smoothly interpolate toward target (includes mouse + fixing animations)
    rotState.current.x += (targetRot.current.x - rotState.current.x) * 0.08;
    rotState.current.y += (targetRot.current.y - rotState.current.y) * 0.08;
    rotState.current.z += (targetRot.current.z - rotState.current.z) * 0.08;

    // Apply mouse rotation on top
    cubeRef.current.rotation.set(
      rotState.current.x + mouseRot.current.x,
      rotState.current.y + mouseRot.current.y,
      rotState.current.z
    );
  });

  useEffect(() => {
    // Track mouse position
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1...1
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;

      // Map to rotation: ±Math.PI radians
      mouseRot.current.x = ny * Math.PI * 0.5;
      mouseRot.current.y = nx * Math.PI * 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Continuous fixing animation
    const fixingCycle = () => {
      const timeline = gsap.timeline();

      // Random fixing motion — pick an axis and "correct" it
      const axis = ['x', 'y', 'z'][Math.floor(Math.random() * 3)] as 'x' | 'y' | 'z';
      const direction = Math.random() > 0.5 ? 1 : -1;

      // Quick fixing motion on one axis (like a hand turn)
      timeline.to(
        targetRot.current,
        {
          [axis]: targetRot.current[axis] + (direction * Math.PI / 2),
          duration: 0.6,
          ease: 'power2.inOut',
        },
        0
      );
    };

    // Start the fixing cycle immediately
    fixingCycle();

    // Schedule next fixing motion every 0.8-1.2 seconds for continuous work
    const interval = setInterval(() => {
      fixingCycle();
    }, 800 + Math.random() * 400);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  // Generate all 27 cubelets (3x3x3)
  const cubelets = [];
  const offset = (CUBELET_SIZE + GAP) * 1.5;

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        // Assign colors: each face gets a different blue shade
        const faceColors = {
          front:  BLUE_SHADES[FACE_COLORS[0]],  // light blue
          back:   BLUE_SHADES[FACE_COLORS[1]],  // sky blue
          right:  BLUE_SHADES[FACE_COLORS[2]],  // steel blue
          left:   BLUE_SHADES[FACE_COLORS[3]],  // navy
          top:    BLUE_SHADES[FACE_COLORS[4]],  // indigo
          bottom: BLUE_SHADES[FACE_COLORS[5]],  // cyan
        };

        cubelets.push(
          <Cubelet
            key={`${x}-${y}-${z}`}
            position={[(x * offset) / CUBE_SCALE, (y * offset) / CUBE_SCALE, (z * offset) / CUBE_SCALE]}
            faceColors={faceColors}
          />
        );
      }
    }
  }

  return <group ref={cubeRef}>{cubelets}</group>;
}

function Scene() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.z = 2.5;
  }, [camera]);

  return (
    <>
      <CubeGroup />
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, 5]} intensity={0.4} />
    </>
  );
}

export default function RubiksCube3D() {
  return (
    <div style={{ width: 'min(180px, 42vw)', height: 'min(180px, 42vw)', borderRadius: '16px', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }} gl={{ antialias: true }}>
        <Scene />
      </Canvas>
    </div>
  );
}
