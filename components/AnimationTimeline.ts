import gsap from 'gsap';
import * as THREE from 'three';

export interface TimelineRefs {
  camera:       THREE.PerspectiveCamera;
  earthGroup:   THREE.Group;
  markersGroup: THREE.Group;
  autoRotate:   { current: boolean };
  text1El:      HTMLElement | null;
  text2El:      HTMLElement | null;
  overlayEl:    HTMLElement | null;
  heroEl:       HTMLElement | null;
}

/**
 * ONE continuous cinematic motion — no pauses, no hard stops.
 *
 * The secret: the camera uses  ease: "power4.in"  which starts
 * imperceptibly slow and rockets at the end.  During the text phase
 * (t 1→8 s) the camera has barely moved ~4 % of its travel; the viewer
 * reads the text while the globe drifts gently.  After t=8 s the camera
 * accelerates into Africa.
 *
 * TIMELINE MAP
 * ──────────────────────────────────────────────────────────────────────
 *  0.0 s   Scene visible, Earth rotating, stars
 *  0.8 s   Camera + Earth rotation both taken over by GSAP (smooth start)
 *  1.0 s   Text 1 fades in
 *  2.0 s   Markers appear (staggered over 3 s)
 *  5.2 s   Text 1 fades out
 *  5.8 s   Text 2 fades in
 *  8.8 s   Text 2 fades out
 *  9.5 s   Non-target markers fade out
 * 11.5 s   Overlay wipes in (black → hero)
 * 12.5 s   Hero content fades in
 * ──────────────────────────────────────────────────────────────────────
 *
 * The camera travels from z=4 → z=1.45 over 13 s with power4.in,
 * so at t=8 s it has only moved ~13 % of the distance.  The real rush
 * happens between t=9 s and t=13.8 s.
 */
export function createAnimationTimeline(refs: TimelineRefs): gsap.core.Timeline {
  const {
    camera, earthGroup, markersGroup,
    autoRotate, text1El, text2El, overlayEl, heroEl,
  } = refs;

  // Lock scroll for the duration of the intro animation
  document.body.style.overflow = 'hidden';

  const isMobile = window.innerWidth < 768;
  const tl = gsap.timeline();

  // ── 1. Hand camera + Earth rotation to GSAP immediately ──────────────────
  //
  // At t=0.8 s we stop useFrame's auto-spin and let GSAP own earthGroup.rotation.
  // We compute the shortest path to bring Nigeria (lon 3.38°) to face
  // the camera (which sits at +Z) by rounding to the nearest 2π multiple.
  tl.call(
    () => {
      autoRotate.current = false;

      const lonRad = -(3.38 * Math.PI / 180);  // lon offset for Nigeria
      const latRad = -(6.52 * Math.PI / 180);  // lat tilt for Nigeria

      const cur    = earthGroup.rotation.y;
      const turns  = Math.round(cur / (2 * Math.PI));
      const target = turns * 2 * Math.PI + lonRad;

      // Earth rotates to face Nigeria — starts immediately, done before zoom
      gsap.to(earthGroup.rotation, {
        y: target,
        x: latRad,
        duration: 8,
        ease: 'power2.inOut',
      });
    },
    [],
    0.8,
  );

  // Camera push-in: fast aggressive zoom that kicks in after text clears
  tl.to(
    camera.position,
    { z: isMobile ? 2.0 : 1.45, y: 0.07, duration: 3.5, ease: 'power3.inOut' },
    9.2,
  );

  // FOV narrows during the fast zoom for cinematic punch
  tl.to(
    camera,
    { fov: isMobile ? 50 : 36, duration: 3.5, ease: 'power2.in',
      onUpdate: () => camera.updateProjectionMatrix() },
    9.2,
  );

  // ── 2. Text 1 ─────────────────────────────────────────────────────────────
  tl.fromTo(
    text1El,
    { opacity: 0, y: 22 },
    { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out' },
    1.0,
  );
  tl.to(text1El, { opacity: 0, y: -16, duration: 0.9, ease: 'power2.in' }, 5.2);

  // ── 3. Markers staggered reveal ───────────────────────────────────────────
  if (markersGroup) {
    markersGroup.children.forEach((markerGroup, i) => {
      tl.call(
        () => {
          markerGroup.visible = true;
          markerGroup.traverse((child) => {
            const mesh = child as THREE.Mesh;
            if (!mesh.isMesh || !mesh.material) return;
            const mat = mesh.material as THREE.MeshBasicMaterial;
            const target = mat.userData.baseOpacity ?? 1;
            gsap.fromTo(mat, { opacity: 0 }, { opacity: target, duration: 0.7, ease: 'power2.out' });
          });
        },
        [],
        2.0 + i * 0.22,
      );
    });
  }

  // ── 4. Text 2 ─────────────────────────────────────────────────────────────
  tl.fromTo(
    text2El,
    { opacity: 0, y: 22 },
    { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' },
    5.8,
  );
  tl.to(text2El, { opacity: 0, y: -16, duration: 0.9, ease: 'power2.in' }, 8.8);

  // ── 5. Non-target markers fade as camera rushes in ────────────────────────
  tl.call(
    () => {
      if (!markersGroup) return;
      markersGroup.children.forEach((group) => {
        if (group.userData.isTarget) return;
        group.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh || !mesh.material) return;
          gsap.to(mesh.material as THREE.MeshBasicMaterial, {
            opacity: 0, duration: 0.8, ease: 'power2.in',
          });
        });
      });
    },
    [],
    9.2,
  );

  // ── 6. Black wipe → hero ──────────────────────────────────────────────────
  tl.to(overlayEl, { opacity: 1, duration: 1.2, ease: 'power3.in' }, 11.8);
  tl.fromTo(heroEl, { opacity: 0 }, {
    opacity:    1,
    duration:   1.0,
    ease:       'power2.out',
    onComplete: () => { document.body.style.overflow = ''; },
  }, 12.6);

  return tl;
}
