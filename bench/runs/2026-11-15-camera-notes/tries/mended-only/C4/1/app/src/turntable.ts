import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// interpolateArcRotateCamera takes the short way round to its goal alpha (camera-notes #29),
// so a goal 2π·turns away would not be followed in the direction alpha grows.
// Each call therefore covers at most π/2, and the calls run one after another
// (a second interpolation on the camera while one is running rejects it, notes #7).
const MAX_SEGMENT_ANGLE = Math.PI / 2;
const SEGMENT_DURATION_MS = 600;

/**
 * Glides the orbit camera `turns` full turns in the direction in which alpha grows.
 * Radius, beta and target are left alone. Resolves when alpha equals
 * its starting value plus 2π·turns.
 */
export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns <= 0) {
    throw new RangeError(`spinAround: turns must be a positive finite number, got ${turns}`);
  }

  const start = camera.alpha;
  const total = 2 * Math.PI * turns;
  const steps = Math.ceil(total / MAX_SEGMENT_ANGLE);

  for (let i = 1; i <= steps; i++) {
    // Unwrapped goals; the last one is exactly start + 2π·turns.
    const goal = i === steps ? start + total : start + (total * i) / steps;
    await interpolateArcRotateCamera(
      scene,
      camera,
      { alpha: goal },
      { durationMs: SEGMENT_DURATION_MS },
    );
  }
}
