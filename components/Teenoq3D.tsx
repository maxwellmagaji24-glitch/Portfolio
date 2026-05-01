'use client';

import { useRef, useEffect } from 'react';

/**
 * Teenoq3D — Interactive 3D text that flips and rotates based on cursor position.
 *
 * Each letter is a separate span with CSS 3D perspective.
 * When cursor moves, letters tilt/flip away from cursor position.
 * Smoothly returns to neutral when idle.
 */

export default function Teenoq3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const text = 'TEENOQ';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isResetting = false;

    const handleMouseMove = (e: MouseEvent) => {
      // If currently resetting, don't interrupt
      if (isResetting) {
        isResetting = false;
      }

      lettersRef.current.forEach((letter, i) => {
        if (!letter) return;

        const rect = letter.getBoundingClientRect();
        const letterCenterX = rect.left + rect.width / 2;
        const letterCenterY = rect.top + rect.height / 2;

        // Distance from cursor to letter center
        const dx = e.clientX - letterCenterX;
        const dy = e.clientY - letterCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Max influence radius (pixels)
        const maxDistance = 250;
        const influence = Math.max(0, 1 - distance / maxDistance);

        // More aggressive rotation based on cursor position
        const rotX = (dy / window.innerHeight) * 60 * influence; // ±30°
        const rotY = (dx / window.innerWidth) * -60 * influence; // ±30°
        const rotZ = (dx / window.innerWidth) * 30 * influence; // ±15° twist

        // Apply transform directly for more reliable 3D
        letter.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) translateZ(20px)`;
        letter.style.transition = 'transform 0.1s ease-out';

        // Clear existing reset timeout
        if (resetTimeoutRef.current) {
          clearTimeout(resetTimeoutRef.current);
        }

        // Schedule reset to neutral position — only trigger after mouse stops for 300ms
        resetTimeoutRef.current = setTimeout(() => {
          isResetting = true;
          lettersRef.current.forEach((l) => {
            if (l) {
              l.style.transition = 'transform 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
              l.style.transform = 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)';
            }
          });
        }, 300);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        perspective: '800px',
        transformStyle: 'preserve-3d',
      }}
    >
      <h1
        className="text-white font-black leading-none tracking-tight"
        style={{
          fontSize: 'clamp(2.8rem, 12vw, 13rem)',
          fontFamily: 'var(--font-orbitron)',
          fontWeight: 900,
          margin: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: '0.08em',
          perspective: '800px',
          transformStyle: 'preserve-3d',
          letterSpacing: '0.05em',
        }}
      >
        {text.split('').map((letter, i) => (
          <span
            key={i}
            ref={(el) => {
              lettersRef.current[i] = el;
            }}
            style={{
              display: 'inline-block',
              transformStyle: 'preserve-3d',
              perspective: '800px',
              textShadow: [
                '0 0 10px rgba(100, 180, 255, 0.5)',
                '0 2px 8px rgba(50, 150, 255, 0.4)',
                '0 4px 16px rgba(20, 100, 200, 0.3)',
                '0 8px 24px rgba(10, 50, 150, 0.2)',
              ].join(', '),
              filter: 'drop-shadow(0 0 12px rgba(100, 180, 255, 0.4))',
              willChange: 'transform',
              transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)',
              transformOrigin: 'center center',
              backfaceVisibility: 'visible',
            }}
          >
            {letter}
          </span>
        ))}
      </h1>
    </div>
  );
}
