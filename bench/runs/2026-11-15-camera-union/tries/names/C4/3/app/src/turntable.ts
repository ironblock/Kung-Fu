import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

// Largest alpha change requested in a single interpolation call. Keeping every
// call under π guarantees that the forward direction is also the shortest one,
// so the sweep never reverses even if the library picks the shortest path.
const MAX_STEP = Math.PI / 2;

/**
 * Glides an arc-rotate camera around its target by `turns` full turns, in the
 * direction in which `alpha` increases. Radius, beta and target are unchanged.
 * Resolves once the camera has arrived at `startAlpha + 2π · turns`.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError(`spinAround: turns must be a finite number >= 0, got ${turns}`);
  }

  const startAlpha = camera.alpha;
  const total = 2 * Math.PI * turns;
  if (total === 0) return;

  // Hold the other orbit parameters at their current values for the whole tour.
  const beta = camera.beta;
  const radius = camera.radius;
  const target = camera.target;

  const steps = Math.max(1, Math.ceil(total / MAX_STEP - 1e-9));
  for (let i = 1; i <= steps; i++) {
    const alpha = i === steps ? startAlpha + total : startAlpha + (total * i) / steps;
    await interpolateArcRotateCamera(camera, scene, { alpha, beta, radius, target });
  }
}
