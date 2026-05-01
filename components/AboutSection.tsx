'use client';

import Image from 'next/image';
import { useRef, useCallback } from 'react';
import Reveal from '@/components/Reveal';

export default function AboutSection() {
  const cardRef   = useRef<HTMLDivElement>(null);
  const glareRef  = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card   = cardRef.current;
    const glare  = glareRef.current;
    const shadow = shadowRef.current;
    if (!card || !glare || !shadow) return;

    const rect = card.getBoundingClientRect();
    const cx   = e.clientX - rect.left;
    const cy   = e.clientY - rect.top;
    const nx   = (cx / rect.width)  * 2 - 1;
    const ny   = (cy / rect.height) * 2 - 1;

    card.style.transform = `perspective(1200px) rotateX(${-ny * 4}deg) rotateY(${nx * 10}deg) scale3d(1.02,1.02,1.02)`;

    const gx = (cx / rect.width)  * 100;
    const gy = (cy / rect.height) * 100;
    glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.18) 0%, transparent 60%)`;
    glare.style.opacity = '1';

    shadow.style.transform = `translateX(${nx * 18}px) translateY(${ny * 10}px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card   = cardRef.current;
    const glare  = glareRef.current;
    const shadow = shadowRef.current;
    if (!card || !glare || !shadow) return;
    card.style.transform   = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    glare.style.opacity    = '0';
    shadow.style.transform = 'translateX(0px) translateY(0px)';
  }, []);

  return (
    <div className="relative z-10 w-full flex flex-col items-center justify-center pt-12 sm:pt-16 pb-16 sm:pb-24" style={{ padding: 'clamp(1.5rem, 4vw, 4rem) clamp(1rem, 6vw, 5rem)' }}>

      {/* About Me header */}
      <Reveal direction="up" delay={0}>
        <h2
          style={{
            fontFamily:    'var(--font-orbitron)',
            fontWeight:    900,
            fontSize:      'clamp(1.5rem, 5vw, 4rem)',
            color:         '#fff',
            letterSpacing: '0.08em',
            marginBottom:  '1.5rem',
            textAlign:     'center',
            textShadow: [
              '0 0 10px rgba(100,180,255,0.5)',
              '0 2px 8px rgba(50,150,255,0.4)',
              '0 4px 16px rgba(20,100,200,0.3)',
            ].join(', '),
          }}
        >
          ABOUT ME
        </h2>
      </Reveal>

      {/* Dynamic shadow layer */}
      <div
        ref={shadowRef}
        className="absolute rounded-2xl pointer-events-none"
        style={{
          width:       '100%',
          aspectRatio: '16 / 9',
          background:  'transparent',
          boxShadow:   '0 40px 120px 20px rgba(0,0,0,0.85), 0 0 80px 10px rgba(30,60,140,0.18)',
          transition:  'transform 0.25s ease',
        }}
      />

      {/* Card */}
      <Reveal direction="up" delay={150} className="relative w-full" style={{ maxWidth: '1380px' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full overflow-hidden rounded-2xl cursor-default"
        style={{
          maxWidth:    '1380px',
          aspectRatio: '16 / 9',
          transition:  'transform 0.15s ease',
          willChange:  'transform',
          border:      '1px solid rgba(255,255,255,0.18)',
          boxShadow: [
            '0 0 0 1px rgba(255,255,255,0.06)',
            'inset 0 1px 0 rgba(255,255,255,0.12)',
            'inset 0 -1px 0 rgba(0,0,0,0.4)',
          ].join(', '),
        }}
      >
        <Image
          src="/Your paragraph text (14).png"
          alt="Teenoq Dev"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1380px) 100vw, 1380px"
          style={{ objectFit: 'contain' }}
          priority
        />

        {/* Top-edge chrome shine */}
        <div
          aria-hidden
          style={{
            position:      'absolute',
            top:           0, left: 0, right: 0,
            height:        '35%',
            background:    'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, transparent 100%)',
            pointerEvents: 'none',
            borderRadius:  '16px 16px 0 0',
          }}
        />

        {/* Bottom vignette */}
        <div
          aria-hidden
          style={{
            position:      'absolute',
            bottom:        0, left: 0, right: 0,
            height:        '30%',
            background:    'linear-gradient(0deg, rgba(0,0,0,0.35) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Glare highlight */}
        <div
          ref={glareRef}
          aria-hidden
          style={{
            position:      'absolute',
            inset:         0,
            opacity:       0,
            pointerEvents: 'none',
            transition:    'opacity 0.1s ease',
            borderRadius:  '16px',
          }}
        />
      </div>
      </Reveal>
    </div>
  );
}
