import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number
): () => void {
  const lower = Math.min(minDistance, maxDistance);
  const upper = Math.max(minDistance, maxDistance);

  const disposeLimits = setCameraLimits(
    camera,
    { lowerRadiusLimit: lower, upperRadiusLimit: upper },
    scene
  );

  const disposeControl = attachControl(camera, canvas, scene, { keyboard: false });

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    disposeControl();
    disposeLimits();
  };
}
