import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Glides an arc-rotate camera around its target by `turns` full turns, in the
 * direction in which alpha grows, using the library's own camera-transition easing.
 *
 * Only alpha is in the goal, so beta (height angle), radius (distance) and target
 * (the point looked at) are left alone. The goal alpha is the starting alpha plus
 * 2π·turns, unwrapped, so the transition ends with alpha exactly at that value.
 */
export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError(`spinAround: turns must be a finite number >= 0, got ${turns}`);
  }
  const goalAlpha = camera.alpha + 2 * Math.PI * turns;
  return interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
}
