'use client';

/**
 * page.tsx — Homepage
 *
 * Layout (all layers stacked via absolute positioning):
 * ┌──────────────────────────────────────────────────┐
 * │  Layer 1 (z-0):  Three.js Canvas (full-screen)   │
 * │  Layer 2 (z-10): Cinematic text overlay           │
 * │  Layer 3 (z-20): White flash overlay (for wipe)  │
 * │  Layer 4 (z-30): Final hero content               │
 * └──────────────────────────────────────────────────┘
 *
 * The GSAP timeline is created once the Scene calls onReady(),
 * which happens after the Canvas mounts and R3F has a camera ref.
 */

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import type { SceneControls } from '@/components/Scene';
import WaterBackground from '@/components/WaterBackground';
import SandBackground from '@/components/SandBackground';
import Teenoq3D from '@/components/Teenoq3D';
import AboutSection from '@/components/AboutSection';
import StackSection from '@/components/StackSection';
import ContactSection from '@/components/ContactSection';
import Reveal from '@/components/Reveal';
import { createAnimationTimeline } from '@/components/AnimationTimeline';

const RubiksCube3D = dynamic(() => import('@/components/RubiksCube3D'), { ssr: false });

// Dynamic import with ssr:false is required for any component that uses
// browser APIs (WebGL, window, etc.) in the Next.js App Router.
const Scene = dynamic(() => import('@/components/Scene'), { ssr: false });

export default function HomePage() {
  // HTML element refs (text + overlays)
  const text1Ref   = useRef<HTMLDivElement>(null);
  const text2Ref   = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const heroRef    = useRef<HTMLDivElement>(null);

  // Callback from <Scene> once Three.js is ready
  // ─────────────────────────────────────────────
  // We receive the camera, earthGroup, markersGroup, and autoRotate ref
  // and immediately pass them to the GSAP timeline factory.
  function handleSceneReady(controls: SceneControls) {
    // Small delay lets R3F complete its first render before GSAP fires
    setTimeout(() => {
      createAnimationTimeline({
        camera:       controls.camera,
        earthGroup:   controls.earthGroup,
        markersGroup: controls.markersGroup,
        autoRotate:   controls.autoRotate,
        text1El:      text1Ref.current,
        text2El:      text2Ref.current,
        overlayEl:    overlayRef.current,
        heroEl:       heroRef.current,
      });
    }, 300);
  }

  return (
    <>
    <main className="relative w-full h-screen bg-black">

      {/* ── Layer 1: 3-D Scene ──────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <Scene onReady={handleSceneReady} />
      </div>

      {/* ── Layer 2: Cinematic text ─────────────────────────────────────── */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">

        {/* Text 1 */}
        <div
          ref={text1Ref}
          className="absolute text-center opacity-0 px-6 w-full"
          style={{ transform: 'translateY(24px)', maxWidth: '700px' }}
        >
          <p
            className="text-white font-light leading-snug"
            style={{
              fontSize: 'clamp(1rem, 3.5vw, 2.1rem)',
              letterSpacing: '0.04em',
              textShadow: '0 0 40px rgba(100,160,255,0.6)',
              fontFamily: 'Georgia, serif',
            }}
          >
            There are{' '}
            <span className="font-semibold text-blue-200">47 million</span>{' '}
            developers around the world…
          </p>
        </div>

        {/* Text 2 */}
        <div
          ref={text2Ref}
          className="absolute text-center opacity-0 px-6 w-full"
          style={{ transform: 'translateY(24px)', maxWidth: '700px' }}
        >
          <p
            className="text-white font-light leading-snug"
            style={{
              fontSize: 'clamp(1.1rem, 4vw, 2.4rem)',
              letterSpacing: '0.04em',
              textShadow: '0 0 40px rgba(100,160,255,0.5)',
              fontFamily: 'Georgia, serif',
            }}
          >
            Yet you&apos;ve come to the{' '}
            <span className="italic font-semibold text-yellow-200">right one.</span>
          </p>
        </div>

      </div>

      {/* ── Layer 3: White flash / wipe overlay ─────────────────────────── */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-20 bg-black opacity-0 pointer-events-none"
      />

      {/* ── Layer 4: Final hero content (fades in after the wipe) ────────── */}
      <div
        ref={heroRef}
        className="absolute inset-0 z-30 flex flex-col items-center justify-center opacity-0 bg-[#00000a]"
      >
        {/* Water ripple layer — sits at the very bottom of the hero stack */}
        <WaterBackground />

        {/* Subtle radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 60%, rgba(30,60,120,0.18) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-8 text-center px-4 sm:px-6">
          {/* Rubik's cube */}
          <RubiksCube3D />

          {/* Label */}
          <span
            className="text-blue-300/70 uppercase"
            style={{ fontFamily: 'monospace', fontSize: 'clamp(0.6rem, 2.5vw, 1rem)', letterSpacing: '0.2em' }}
          >
            Frontend · Blockchain Developer · Founder
          </span>

          {/* Name — 3D interactive text */}
          <Teenoq3D />

          {/* Full name */}
          <p
            className="text-white/40 uppercase"
            style={{ fontFamily: 'monospace', fontSize: 'clamp(0.7rem, 2.2vw, 1.1rem)', letterSpacing: '0.15em' }}
          >
            Maxwell Magaji
          </p>

          {/* Tagline */}
          <p
            className="text-white/55 font-light leading-relaxed"
            style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.45rem)', maxWidth: 'min(700px, 90vw)' }}
          >
            Building cinematic web experiences &amp; decentralized systems in no time.
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/25 text-xs tracking-widest uppercase" style={{ fontFamily: 'monospace' }}>
            Scroll
          </span>
          <div className="w-px h-10 bg-gradient-to-b from-white/25 to-transparent" />
        </div>
      </div>

    </main>

    {/* ── Sand Section (fades in after water hero) ────────────────────────── */}
    <section
      className="relative w-full flex items-start justify-center overflow-hidden"
      style={{
        background:     'linear-gradient(180deg, #00000a 0%, #0a0a15 50%, #10101f 100%)',
        paddingBottom:  'clamp(2rem, 6vw, 6rem)',
      }}
    >
      {/* Sand ripple background */}
      <SandBackground />

      <AboutSection />
    </section>

    {/* ── Skills Section ───────────────────────────────────────────────────── */}
    <section
      className="relative w-full flex flex-col items-center justify-start px-8"
      style={{
        background:     'linear-gradient(180deg, #10101f 0%, #0a0a15 50%, #00000a 100%)',
        paddingTop:    'clamp(2rem, 5vw, 5rem)',
        paddingBottom: 'clamp(2rem, 5vw, 4rem)',
      }}
    >
      <Reveal direction="up">
        <h2
          style={{
            fontFamily:    'var(--font-orbitron)',
            fontWeight:    900,
            fontSize:      'clamp(2rem, 5vw, 4rem)',
            color:         '#fff',
            letterSpacing: '0.08em',
            marginBottom:  '3rem',
            textShadow: [
              '0 0 10px rgba(100,180,255,0.5)',
              '0 2px 8px rgba(50,150,255,0.4)',
              '0 4px 16px rgba(20,100,200,0.3)',
            ].join(', '),
          }}
        >
          SKILL SET (STACK)
        </h2>
      </Reveal>

      <Reveal direction="up" delay={150}>
        <StackSection />
      </Reveal>
    </section>

    {/* ── Projects Section ─────────────────────────────────────────────────── */}
    <section
      className="relative w-full flex flex-col items-center justify-start px-8"
      style={{
        background:    'linear-gradient(180deg, #00000a 0%, #0a0a15 50%, #10101f 100%)',
        paddingTop:    'clamp(2rem, 5vw, 4rem)',
        paddingBottom: 'clamp(2.5rem, 6vw, 6rem)',
      }}
    >
      <Reveal direction="up">
        <h2
          style={{
            fontFamily:    'var(--font-orbitron)',
            fontWeight:    900,
            fontSize:      'clamp(2rem, 5vw, 4rem)',
            color:         '#fff',
            letterSpacing: '0.08em',
            marginBottom:  '2rem',
            textShadow: [
              '0 0 10px rgba(100,180,255,0.5)',
              '0 2px 8px rgba(50,150,255,0.4)',
              '0 4px 16px rgba(20,100,200,0.3)',
            ].join(', '),
          }}
        >
          PROJECTS
        </h2>
      </Reveal>

      <Reveal direction="up" delay={150}>
        <p
          style={{
            fontFamily:    'var(--font-geist-sans)',
            fontSize:      'clamp(0.95rem, 1.8vw, 1.2rem)',
            color:         'rgba(255,255,255,0.45)',
            textAlign:     'center',
            maxWidth:      '520px',
            lineHeight:    1.8,
            letterSpacing: '0.02em',
          }}
        >
          Currently heads-down building new projects. <br />
          Nothing here is old work — everything dropping here will be fresh.{' '}
          <span style={{ color: 'rgba(100,180,255,0.7)' }}>Stay tuned.</span>
        </p>
      </Reveal>
    </section>

    {/* ── Contact Section ──────────────────────────────────────────────────── */}
    <ContactSection />
    </>
  );
}
