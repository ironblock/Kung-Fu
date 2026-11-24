import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

type RadiusLimits = {
  lowerRadiusLimit?: number | undefined;
  upperRadiusLimit?: number | undefined;
};

export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number,
): () => void {
  let lowerRadiusLimit = Number.isFinite(minDistance) ? minDistance : undefined;
  let upperRadiusLimit = Number.isFinite(maxDistance) ? maxDistance : undefined;

  if (
    lowerRadiusLimit !== undefined &&
    upperRadiusLimit !== undefined &&
    lowerRadiusLimit > upperRadiusLimit
  ) {
    const temp = lowerRadiusLimit;
    lowerRadiusLimit = upperRadiusLimit;
    upperRadiusLimit = temp;
  }

  const limits: RadiusLimits = { lowerRadiusLimit, upperRadiusLimit };

  const disposeLimits = setCameraLimits(
    camera,
    limits as Parameters<typeof setCameraLimits>[1],
    scene,
  );

  const disposeControls = attachControl(camera, canvas, scene);

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    disposeControls();
    disposeLimits();
  };
}
