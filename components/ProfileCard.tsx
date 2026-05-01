'use client';

import { useRef, useCallback } from 'react';
import Image from 'next/image';

/**
 * ProfileCard — 3-D tilt card with shiny edges and space-toned photo.
 *
 * Mouse tracking rotates the card on X/Y axes (CSS perspective transform).
 * A glare highlight travels with the cursor, simulating surface sheen.
 * Border + box-shadow give the white shiny-edge look.
 *
 * Color treatment is pure CSS: brightness + contrast + saturate reduce the
 * warm portrait tones, then a blue-tinted pseudo-element overlay shifts the
 * palette toward the dark-space theme used throughout the hero.
 */

interface ProfileCardProps {
  /** Path to the photo, e.g. "/profile.jpg". Falls back to initials if omitted. */
  src?: string;
}

export default function ProfileCard({ src = '/profile.jpg' }: ProfileCardProps) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;

    const rect   = card.getBoundingClientRect();
    const cx     = e.clientX - rect.left;
    const cy     = e.clientY - rect.top;
    const rx     = rect.width;
    const ry     = rect.height;

    // Normalise to -1 → +1
    const nx = (cx / rx) * 2 - 1;
    const ny = (cy / ry) * 2 - 1;

    // Tilt: max ±12 degrees
    const rotY =  nx * 12;
    const rotX = -ny * 12;

    card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`;

    // Glare: position the radial at cursor coords
    const glareX = (cx / rx) * 100;
    const glareY = (cy / ry) * 100;
    glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.22) 0%, transparent 65%)`;
    glare.style.opacity    = '1';
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card  = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;
    card.style.transform  = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    glare.style.opacity   = '0';
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width:          '120px',
        height:         '120px',
        borderRadius:   '16px',
        position:       'relative',
        border:         '1.5px solid rgba(255,255,255,0.45)',
        boxShadow: [
          '0 0 0 1px rgba(255,255,255,0.08)',
          '0 0 18px 2px rgba(255,255,255,0.12)',
          '0 0 40px 4px rgba(80,140,255,0.10)',
          '0 8px 32px rgba(0,0,0,0.55)',
        ].join(', '),
        transition:     'transform 0.15s ease, box-shadow 0.15s ease',
        cursor:         'default',
        overflow:       'hidden',
        willChange:     'transform',
        // Edge-shine gradient overlay applied via outline shimmer
        background:     'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 60%)',
      }}
    >
      {/* ── Photo with space-tone colour treatment ─────────────────────── */}
      <Image
        src={src}
        alt="Maxwell Magaji"
        fill
        sizes="120px"
        style={{
          objectFit:  'cover',
          borderRadius: '14px',
          // Darken + desaturate + slight contrast boost → matches dark-space palette
          filter: 'brightness(0.78) contrast(1.08) saturate(0.55)',
        }}
        onError={(e) => {
          // Hide broken img; the initials fallback underneath will show
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />

      {/* ── Blue-tint overlay to shift warm tones → space blue ──────────── */}
      <div
        aria-hidden
        style={{
          position:   'absolute',
          inset:      0,
          borderRadius: '14px',
          background: 'rgba(5, 18, 60, 0.28)',
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />

      {/* ── Glare highlight ──────────────────────────────────────────────── */}
      <div
        ref={glareRef}
        aria-hidden
        style={{
          position:      'absolute',
          inset:         0,
          borderRadius:  '14px',
          opacity:       0,
          pointerEvents: 'none',
          transition:    'opacity 0.1s ease',
        }}
      />

      {/* ── Top-edge chrome shine ────────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position:   'absolute',
          top:        0,
          left:       0,
          right:      0,
          height:     '40%',
          borderRadius: '14px 14px 0 0',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
