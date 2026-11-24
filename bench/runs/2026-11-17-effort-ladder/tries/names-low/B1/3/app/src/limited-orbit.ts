import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number
): () => void {
  const detachControl = attachControl(camera, canvas, scene);

  const detachLimits = setCameraLimits(
    camera,
    { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
    scene
  );

  if (camera.radius < minDistance) {
    camera.radius = minDistance;
  } else if (camera.radius > maxDistance) {
    camera.radius = maxDistance;
  }

  return () => {
    detachControl();
    detachLimits();
  };
}
