import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number
): () => void {
  const lower = Math.max(0, Math.min(minDistance, maxDistance));
  const upper = Math.max(lower, Math.max(minDistance, maxDistance));
  const clampRadius = (radius: number): number => Math.min(Math.max(radius, lower), upper);

  const disposeLimits = setCameraLimits(
    camera,
    {
      lowerRadiusLimit: lower,
      upperRadiusLimit: upper,
    },
    scene
  );

  try {
    camera.radius = clampRadius(camera.radius);
    camera._clampToLimits?.();

    const disposeControl = attachControl(camera, canvas, scene);

    return () => {
      disposeControl();
      disposeLimits();
    };
  } catch (error) {
    disposeLimits();
    throw error;
  }
}
