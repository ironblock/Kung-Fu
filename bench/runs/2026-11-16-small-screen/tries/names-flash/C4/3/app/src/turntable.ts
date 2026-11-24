import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns === 0) {
    return;
  }

  const startAlpha = camera.alpha;
  const targetAlpha = startAlpha + TWO_PI * turns;

  // Animate only alpha so radius, beta, and target stay unchanged.
  await interpolateArcRotateCamera(camera, scene, { alpha: targetAlpha });

  // Guarantee the exact requested unwrapped alpha value on completion.
  camera.alpha = targetAlpha;
}
