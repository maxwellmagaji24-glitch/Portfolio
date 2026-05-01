'use client';

import Image from 'next/image';
import { useRef, useCallback } from 'react';
import { useMediaQuery } from '@/lib/useMediaQuery';

const stack = [
  { name: 'HTML5',       src: '/stack logo/html.png' },
  { name: 'CSS3',        src: '/stack logo/CSS3_logo.svg.png' },
  { name: 'JavaScript',  src: '/stack logo/JavaScript-logo.png' },
  { name: 'React',       src: '/stack logo/react logo.png' },
  { name: 'Next.js',     src: '/stack logo/next js logo.png' },
  { name: 'Rust',        src: '/stack logo/rust logo.png' },
  { name: 'Anchor',      src: '/stack logo/anchor framework logo.jpeg' },
  { name: 'Nano Banana', src: '/stack logo/nano banana.jpeg' },
  { name: 'Claude AI',   src: '/stack logo/claude logo.png' },
];

function StackCard({ name, src }: { name: string; src: string }) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const size     = isMobile ? '80px' : '110px';

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card  = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;

    const rect = card.getBoundingClientRect();
    const cx   = e.clientX - rect.left;
    const cy   = e.clientY - rect.top;
    const nx   = (cx / rect.width)  * 2 - 1;
    const ny   = (cy / rect.height) * 2 - 1;

    card.style.transform = `perspective(500px) rotateX(${-ny * 22}deg) rotateY(${nx * 22}deg) scale3d(1.1,1.1,1.1)`;

    const gx = (cx / rect.width)  * 100;
    const gy = (cy / rect.height) * 100;
    glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.28) 0%, transparent 65%)`;
    glare.style.opacity = '1';
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card  = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;
    card.style.transform  = 'perspective(500px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    glare.style.opacity   = '0';
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
      {/* 3D card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          width:        size,
          height:       size,
          borderRadius: '20px',
          position:     'relative',
          border:       '1px solid rgba(255,255,255,0.14)',
          background:   'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
          boxShadow: [
            '0 0 0 1px rgba(255,255,255,0.04)',
            '0 8px 32px rgba(0,0,0,0.7)',
            '0 0 24px rgba(80,140,255,0.12)',
            'inset 0 1px 0 rgba(255,255,255,0.10)',
          ].join(', '),
          transition:   'transform 0.15s ease, box-shadow 0.15s ease',
          cursor:       'default',
          overflow:     'hidden',
          willChange:   'transform',
        }}
      >
        {/* Logo */}
        <Image
          src={src}
          alt={name}
          fill
          sizes={size}
          style={{ objectFit: 'contain', padding: '18px' }}
        />

        {/* Glare */}
        <div
          ref={glareRef}
          aria-hidden
          style={{
            position:      'absolute',
            inset:         0,
            borderRadius:  '20px',
            opacity:       0,
            pointerEvents: 'none',
            transition:    'opacity 0.1s ease',
          }}
        />

        {/* Top-edge chrome shine */}
        <div
          aria-hidden
          style={{
            position:      'absolute',
            top:           0,
            left:          0,
            right:         0,
            height:        '45%',
            borderRadius:  '20px 20px 0 0',
            background:    'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Bottom depth shadow */}
        <div
          aria-hidden
          style={{
            position:      'absolute',
            bottom:        0,
            left:          0,
            right:         0,
            height:        '35%',
            background:    'linear-gradient(0deg, rgba(0,0,0,0.45) 0%, transparent 100%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily:    'var(--font-orbitron)',
          fontSize:      '0.6rem',
          fontWeight:    700,
          color:         'rgba(255,255,255,0.70)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textAlign:     'center',
          textShadow:    '0 0 8px rgba(100,180,255,0.3)',
        }}
      >
        {name}
      </span>
    </div>
  );
}

export default function StackSection() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div
      style={{
        display:        'flex',
        flexWrap:       'wrap',
        gap:            isMobile ? '1.5rem' : '2.5rem',
        justifyContent: 'center',
        maxWidth:       '900px',
        width:          '100%',
      }}
    >
      {stack.map((item) => (
        <StackCard key={item.name} name={item.name} src={item.src} />
      ))}
    </div>
  );
}
