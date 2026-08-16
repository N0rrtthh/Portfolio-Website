import * as THREE from "three";

/**
 * Flight-path helpers for the Experience timeline.
 *
 * The camera rides a Catmull-Rom curve driven by scroll progress. Sampling the
 * curve once into a flat array (instead of calling `curve.getPoint()` every
 * frame) keeps the per-frame cost at two array reads plus one lerp.
 */

export const CURVE_SAMPLE_COUNT = 480;

/** Normalized curve positions (0-1) where the timeline nodes sit. */
export const NODE_FRACTIONS = [0.14, 0.38, 0.64, 0.88];

export function createFlightCurve() {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 14),
    new THREE.Vector3(4.8, 2.2, 0),
    new THREE.Vector3(-3.9, -1.8, -30),
    new THREE.Vector3(5.5, 1.9, -60),
    new THREE.Vector3(-4.5, -2.4, -90),
    new THREE.Vector3(0, 0, -115),
  ]);
}

/**
 * Linear-interpolated lookup into a pre-sampled curve.
 * Writes into `target` so callers can reuse a single Vector3 (zero allocation).
 */
export function samplePath(
  samples: THREE.Vector3[],
  progress: number,
  target: THREE.Vector3
) {
  const clamped = progress < 0 ? 0 : progress > 1 ? 1 : progress;
  const scaled = clamped * (samples.length - 1);
  const i = Math.floor(scaled);
  const j = Math.min(i + 1, samples.length - 1);
  return target.lerpVectors(samples[i], samples[j], scaled - i);
}
