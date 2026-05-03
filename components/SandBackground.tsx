'use client';

/**
 * SandBackground.tsx
 *
 * Sand ripple simulation — same physics as water but with warm sand tones.
 * Creates desert dune effect with slightly warmer, earthier colors.
 */

import { useEffect, useRef } from 'react';

const SIM_W    = 240;
const SIM_H    = 160;
const DAMPING  = 0.982;

export default function SandBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let buf0 = new Float32Array(SIM_W * SIM_H);
    let buf1 = new Float32Array(SIM_W * SIM_H);

    let lastSX = -99;
    let lastSY = -99;

    function toSim(clientX: number, clientY: number) {
      const r = canvas!.getBoundingClientRect();
      return {
        sx: Math.round((clientX - r.left)  / r.width  * (SIM_W - 1)),
        sy: Math.round((clientY - r.top)   / r.height * (SIM_H - 1)),
      };
    }

    function splash(cx: number, cy: number, radius: number, strength: number) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy > radius * radius) continue;
          const px = cx + dx;
          const py = cy + dy;
          if (px < 1 || px >= SIM_W - 1 || py < 1 || py >= SIM_H - 1) continue;
          buf0[py * SIM_W + px] += strength;
        }
      }
    }

    function step() {
      for (let y = 1; y < SIM_H - 1; y++) {
        for (let x = 1; x < SIM_W - 1; x++) {
          const i = y * SIM_W + x;
          buf1[i] =
            ((buf0[(y - 1) * SIM_W + x] +
              buf0[(y + 1) * SIM_W + x] +
              buf0[y * SIM_W + (x - 1)] +
              buf0[y * SIM_W + (x + 1)]) /
              2 -
              buf1[i]) *
            DAMPING;
        }
      }
      const tmp = buf0;
      buf0 = buf1;
      buf1 = tmp;
    }

    function render() {
      const img = ctx.createImageData(SIM_W, SIM_H);
      const d   = img.data;

      for (let i = 0; i < SIM_W * SIM_H; i++) {
        const h   = buf0[i];
        // Sand: warm golden tones, slightly more visible than water
        const glow  = Math.max(0, h);
        const alpha = Math.min(45, glow * 3.2);

        const p = i * 4;
        d[p]     = Math.min(255, glow * 1.0 + 140);  // R — warm golden
        d[p + 1] = Math.min(255, glow * 0.85 + 120); // G — sandy
        d[p + 2] = Math.min(255, glow * 0.6 + 80);   // B — earthy
        d[p + 3] = Math.floor(alpha);
      }

      ctx.putImageData(img, 0, 0);
    }

    let frame  = 0;
    let rafId: number;

    function animate() {
      step();
      render();
      frame++;

      if (frame % 180 === 0) {
        splash(
          1 + Math.floor(Math.random() * (SIM_W - 2)),
          1 + Math.floor(Math.random() * (SIM_H - 2)),
          3,
          50,
        );
      }

      rafId = requestAnimationFrame(animate);
    }

    function onMouseMove(e: MouseEvent) {
      const { sx, sy } = toSim(e.clientX, e.clientY);
      const dx = sx - lastSX;
      const dy = sy - lastSY;
      if (dx * dx + dy * dy >= 4) {
        splash(sx, sy, 4, 100);
        lastSX = sx;
        lastSY = sy;
      }
    }

    window.addEventListener('mousemove', onMouseMove);
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={SIM_W}
      height={SIM_H}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        mixBlendMode: 'screen',
        opacity: 0.75,
      }}
    />
  );
}
