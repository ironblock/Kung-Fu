import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
  if (!Number.isFinite(turns) || turns === 0) {
    return Promise.resolve();
  }

  const startAlpha = camera.alpha;
  const targetAlpha = startAlpha + Math.PI * 2 * turns;

  return interpolateArcRotateCamera(camera, scene, { alpha: targetAlpha }).then(() => {
    camera.alpha = targetAlpha;
  });
}
