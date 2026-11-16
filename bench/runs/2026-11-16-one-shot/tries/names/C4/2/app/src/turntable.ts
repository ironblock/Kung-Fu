import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

// Largest alpha change requested from the library in one transition. Keeping each
// step at or below π/2 means the move is always the intended way round, even if the
// library takes the shorter arc to an absolute alpha goal.
const MAX_STEP = Math.PI / 2;

export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError(`spinAround: turns must be a finite number >= 0, got ${turns}`);
  }

  const totalAngle = 2 * Math.PI * turns;
  if (totalAngle === 0) {
    return;
  }

  const startAlpha = camera.alpha;
  const steps = Math.ceil(totalAngle / MAX_STEP);

  // Distance, height angle and look-at point are held constant for the whole glide.
  const beta = camera.beta;
  const radius = camera.radius;
  const target = camera.target;

  for (let i = 1; i <= steps; i++) {
    const alpha = i === steps
      ? startAlpha + totalAngle
      : startAlpha + totalAngle * (i / steps);
    await interpolateArcRotateCamera(camera, scene, { alpha, beta, radius, target });
  }
}
