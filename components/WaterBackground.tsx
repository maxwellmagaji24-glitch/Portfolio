'use client';

/**
 * WaterBackground.tsx
 *
 * Classic two-buffer water ripple simulation running on a <canvas>.
 * The canvas is composited over the hero section using CSS mix-blend-mode:screen
 * so the waves appear as subtle bright shimmer on the dark background —
 * no colour change, just light refracting on dark water.
 *
 * HOW THE SIMULATION WORKS
 * ─────────────────────────────────────────────────────────────
 * Two height-field buffers (buf0 = previous frame, buf1 = current).
 * Each step:
 *   new[x,y] = (prev[x-1,y] + prev[x+1,y] + prev[x,y-1] + prev[x,y+1]) / 2
 *              - current[x,y]
 *   new[x,y] *= DAMPING    ← energy loss per frame (lower = longer ripples)
 *
 * Mouse movement splashes a small circle of displaced height into buf0.
 * Ambient random splashes every ~3 s keep the surface alive when idle.
 *
 * Rendering: wave height → alpha value of a near-white pixel.
 * screen blend-mode means those bright pixels ADD to the dark background.
 * ─────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from 'react';

// Run simulation at a lower resolution for performance; CSS scales it up smoothly.
const SIM_W    = 240;
const SIM_H    = 160;
const DAMPING  = 0.982; // 0.98 = quick fade, 0.99 = long-lasting ripples

export default function WaterBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Two height-field buffers
    let buf0 = new Float32Array(SIM_W * SIM_H); // previous
    let buf1 = new Float32Array(SIM_W * SIM_H); // current (will be swapped)

    // Track last simulation-space mouse position to throttle ripple creation
    let lastSX = -99;
    let lastSY = -99;

    // ── Helpers ─────────────────────────────────────────────────────────────

    /** Convert screen coords → simulation-grid coords */
    function toSim(clientX: number, clientY: number) {
      const r = canvas!.getBoundingClientRect();
      return {
        sx: Math.round((clientX - r.left)  / r.width  * (SIM_W - 1)),
        sy: Math.round((clientY - r.top)   / r.height * (SIM_H - 1)),
      };
    }

    /** Deposit a circular displaced region into buf0 */
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

    // ── Simulation step ──────────────────────────────────────────────────────
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
      // Swap buffers
      const tmp = buf0;
      buf0 = buf1;
      buf1 = tmp;
    }

    // ── Render height field → canvas pixels ──────────────────────────────────
    function render() {
      const img = ctx.createImageData(SIM_W, SIM_H);
      const d   = img.data;

      for (let i = 0; i < SIM_W * SIM_H; i++) {
        const h   = buf0[i];
        // Crests glow brighter; troughs are black (transparent).
        // Max alpha kept low (~38) so the effect stays very subtle.
        const glow  = Math.max(0, h);              // only positive (crest) values
        const alpha = Math.min(38, glow * 3.2);    // scale to max ~38/255 ≈ 15 %

        const p = i * 4;
        d[p]     = Math.min(255, glow * 0.80); // R — slightly warm
        d[p + 1] = Math.min(255, glow * 0.90); // G
        d[p + 2] = Math.min(255, glow * 1.30); // B — slight aqua tint
        d[p + 3] = Math.floor(alpha);
      }

      ctx.putImageData(img, 0, 0);
    }

    // ── Animation loop ───────────────────────────────────────────────────────
    let frame  = 0;
    let rafId: number;

    function animate() {
      step();
      render();
      frame++;

      // Ambient idle ripples every ~3 s (180 frames @ 60 fps)
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

    // ── Mouse interaction ────────────────────────────────────────────────────
    function onMouseMove(e: MouseEvent) {
      const { sx, sy } = toSim(e.clientX, e.clientY);
      const dx = sx - lastSX;
      const dy = sy - lastSY;
      // Only splash if cursor moved at least 2 simulation cells (avoids spam)
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
        mixBlendMode: 'screen',  // bright pixels add to dark bg; black is invisible
        opacity: 0.85,
      }}
    />
  );
}
