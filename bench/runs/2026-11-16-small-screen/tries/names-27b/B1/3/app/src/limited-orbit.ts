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

  const previousLowerRadiusLimit = camera.lowerRadiusLimit;
  const previousUpperRadiusLimit = camera.upperRadiusLimit;

  camera.radius = Math.min(Math.max(camera.radius, lower), upper);

  const detachLimits = setCameraLimits(
    camera,
    {
      lowerRadiusLimit: lower,
      upperRadiusLimit: upper,
    },
    scene
  );

  const detachControls = attachControl(camera, canvas, scene);

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;

    detachControls();
    detachLimits();

    camera.lowerRadiusLimit = previousLowerRadiusLimit;
    camera.upperRadiusLimit = previousUpperRadiusLimit;
  };
}
