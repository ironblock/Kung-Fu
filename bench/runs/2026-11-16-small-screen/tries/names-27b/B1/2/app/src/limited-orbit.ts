import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number
): () => void {
  const lower = Math.max(0, Math.min(minDistance, maxDistance));
  const upper = Math.max(lower, Math.max(minDistance, maxDistance));

  const clampRadius = (radius: number): number =>
    Math.min(Math.max(radius, lower), upper);

  const previousLower = camera.lowerRadiusLimit;
  const previousUpper = camera.upperRadiusLimit;

  const disposeLimits = setCameraLimits(
    camera,
    { lowerRadiusLimit: lower, upperRadiusLimit: upper },
    scene
  );

  camera.radius = clampRadius(camera.radius);
  camera._clampToLimits?.();

  const disposeControls = attachControl(camera, canvas, scene);

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    disposeControls();
    disposeLimits();
    camera.lowerRadiusLimit = previousLower;
    camera.upperRadiusLimit = previousUpper;
  };
}
