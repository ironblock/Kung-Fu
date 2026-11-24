import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

const TWO_PI = 2 * Math.PI;

// interpolateArcRotateCamera takes the shortest arc to an alpha goal, so a goal
// a full turn away would not move at all. Each leg is kept at no more than a
// quarter turn so the shortest arc is always the forward one.
const MAX_LEG_RADIANS = Math.PI / 2;

/**
 * Glide an orbit camera forward (in the direction alpha grows) by `turns`
 * full turns, keeping its radius, beta and target unchanged.
 *
 * The move is split into legs of at most a quarter turn, each driven by the
 * library's `interpolateArcRotateCamera`. Leg goals are absolute, so the camera
 * ends at exactly `startAlpha + 2π · turns`.
 *
 * Rejects if the library cancels the transition (for example on user input).
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
  const totalAngle = TWO_PI * turns;
  if (totalAngle === 0) return;

  const legCount = Math.ceil(totalAngle / MAX_LEG_RADIANS);
  for (let i = 1; i <= legCount; i++) {
    const goalAlpha = i === legCount ? startAlpha + totalAngle : startAlpha + (totalAngle * i) / legCount;
    await interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
  }
}
