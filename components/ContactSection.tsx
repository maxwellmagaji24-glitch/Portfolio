'use client';

import { useRef, useCallback } from 'react';
import { useMediaQuery } from '@/lib/useMediaQuery';
import Reveal from '@/components/Reveal';

const contacts = [
  {
    label: 'Email',
    value: 'teenoqnanchin@gmail.com',
    href:  'mailto:teenoqnanchin@gmail.com',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 7l10 7 10-7" />
      </svg>
    ),
  },
  {
    label: 'X (Twitter)',
    value: '@Teenoqsx',
    href:  'https://x.com/Teenoqsx',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

function ContactCard({
  label, value, href, icon,
}: {
  label: string;
  value: string;
  href:  string;
  icon:  React.ReactNode;
}) {
  const cardRef  = useRef<HTMLAnchorElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const card  = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;

    const rect = card.getBoundingClientRect();
    const cx   = e.clientX - rect.left;
    const cy   = e.clientY - rect.top;
    const nx   = (cx / rect.width)  * 2 - 1;
    const ny   = (cy / rect.height) * 2 - 1;

    card.style.transform = `perspective(600px) rotateX(${-ny * 16}deg) rotateY(${nx * 16}deg) scale3d(1.05,1.05,1.05)`;

    const gx = (cx / rect.width)  * 100;
    const gy = (cy / rect.height) * 100;
    glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.22) 0%, transparent 65%)`;
    glare.style.opacity    = '1';
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card  = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;
    card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    glare.style.opacity  = '0';
  }, []);

  return (
    <a
      ref={cardRef}
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position:       'relative',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '1rem',
        width:          isMobile ? '100%' : '260px',
        padding:        '2.5rem 2rem',
        borderRadius:   '20px',
        border:         '1px solid rgba(255,255,255,0.12)',
        background:     'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        boxShadow: [
          '0 0 0 1px rgba(255,255,255,0.04)',
          '0 8px 40px rgba(0,0,0,0.7)',
          '0 0 30px rgba(80,140,255,0.10)',
          'inset 0 1px 0 rgba(255,255,255,0.10)',
        ].join(', '),
        transition:     'transform 0.15s ease, box-shadow 0.15s ease',
        willChange:     'transform',
        cursor:         'pointer',
        textDecoration: 'none',
        overflow:       'hidden',
      }}
    >
      {/* Icon */}
      <div style={{ color: 'rgba(100,180,255,0.85)', filter: 'drop-shadow(0 0 8px rgba(100,180,255,0.5))' }}>
        {icon}
      </div>

      {/* Label */}
      <span style={{
        fontFamily:    'var(--font-orbitron)',
        fontSize:      '0.65rem',
        fontWeight:    700,
        letterSpacing: '0.18em',
        color:         'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>

      {/* Value */}
      <span style={{
        fontFamily:    'var(--font-geist-mono)',
        fontSize:      '0.85rem',
        color:         'rgba(255,255,255,0.80)',
        letterSpacing: '0.02em',
        textAlign:     'center',
        wordBreak:     'break-all',
      }}>
        {value}
      </span>

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
          height:        '40%',
          borderRadius:  '20px 20px 0 0',
          background:    'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
    </a>
  );
}

export default function ContactSection() {
  return (
    <section
      style={{
        width:          '100%',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        padding:        'clamp(2rem, 5vw, 5rem) clamp(1rem, 4vw, 2rem) clamp(2.5rem, 6vw, 6rem)',
        background:     'linear-gradient(180deg, #10101f 0%, #080810 60%, #000005 100%)',
        position:       'relative',
        overflow:       'hidden',
      }}
    >
      {/* Subtle radial glow behind content */}
      <div
        aria-hidden
        style={{
          position:   'absolute',
          top:        '30%',
          left:       '50%',
          transform:  'translateX(-50%)',
          width:      '600px',
          height:     '400px',
          background: 'radial-gradient(ellipse at center, rgba(30,80,180,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <Reveal direction="up">
        <h2
          style={{
            fontFamily:    'var(--font-orbitron)',
            fontWeight:    900,
            fontSize:      'clamp(2rem, 5vw, 4rem)',
            color:         '#fff',
            letterSpacing: '0.08em',
            marginBottom:  '1rem',
            textShadow: [
              '0 0 10px rgba(100,180,255,0.5)',
              '0 2px 8px rgba(50,150,255,0.4)',
              '0 4px 16px rgba(20,100,200,0.3)',
            ].join(', '),
          }}
        >
          CONTACT
        </h2>
      </Reveal>

      {/* Tagline */}
      <Reveal direction="up" delay={100}>
        <p
          style={{
            fontFamily:    'var(--font-geist-sans)',
            fontSize:      'clamp(0.9rem, 1.6vw, 1.1rem)',
            color:         'rgba(255,255,255,0.35)',
            letterSpacing: '0.04em',
            marginBottom:  '3.5rem',
            textAlign:     'center',
          }}
        >
          Have an idea? Let&apos;s build something worth remembering.
        </p>
      </Reveal>

      {/* Cards */}
      <Reveal direction="up" delay={200}>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '600px' }}>
          {contacts.map((c) => (
            <ContactCard key={c.label} {...c} />
          ))}
        </div>
      </Reveal>

      {/* Bottom divider line */}
      <div
        aria-hidden
        style={{
          marginTop:   '5rem',
          width:       '100%',
          maxWidth:    '600px',
          height:      '1px',
          background:  'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
        }}
      />

      {/* Footer note */}
      <p
        style={{
          marginTop:     '1.5rem',
          fontFamily:    'var(--font-geist-mono)',
          fontSize:      '0.7rem',
          color:         'rgba(255,255,255,0.18)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        © {new Date().getFullYear()} Maxwell Magaji — Teenoq
      </p>
    </section>
  );
}
