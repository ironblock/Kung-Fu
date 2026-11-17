import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number
): () => void {
  const lower = Math.min(minDistance, maxDistance);
  const upper = Math.max(minDistance, maxDistance);

  const detachControls = attachControl(camera, canvas, scene);
  const detachLimits = setCameraLimits(
    camera,
    { lowerRadiusLimit: lower, upperRadiusLimit: upper },
    scene
  );

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    detachControls();
    detachLimits();
  };
}
