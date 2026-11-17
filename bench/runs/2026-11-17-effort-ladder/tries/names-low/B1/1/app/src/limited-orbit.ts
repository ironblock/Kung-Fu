import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number
): () => void {
  // Bring the camera inside the range immediately if it started outside.
  camera.radius = Math.max(minDistance, Math.min(maxDistance, camera.radius));

  // Set the radius limits on the camera and register per-frame clamping
  // via the scene's render loop.
  const cleanupLimits = setCameraLimits(
    camera,
    { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
    scene,
  );

  // Attach the library's standard pointer controls (drag-to-orbit,
  // wheel/pinch-to-zoom) on the canvas.
  const cleanupControls = attachControl(camera, canvas, scene);

  return () => {
    cleanupControls();
    cleanupLimits();
  };
}
