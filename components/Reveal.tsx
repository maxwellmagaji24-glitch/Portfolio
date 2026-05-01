'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';

interface RevealProps {
  children:   ReactNode;
  delay?:     number;
  direction?: 'up' | 'left' | 'right' | 'none';
  distance?:  number;
  className?: string;
  style?:     React.CSSProperties;
}

export default function Reveal({
  children,
  delay     = 0,
  direction = 'up',
  distance  = 40,
  className,
  style,
}: RevealProps) {
  const ref     = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hidden: Record<string, string> = {
    up:    `translateY(${distance}px)`,
    left:  `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
    none:  'none',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translate(0,0)' : hidden[direction],
        transition: `opacity 0.75s cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform 0.75s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
