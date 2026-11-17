import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number
): () => void {
  // Set the radius limits so the library clamps zoom (including inertial
  // drift) to the allowed range on every frame.
  const removeLimits = setCameraLimits(
    camera,
    { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
    scene,
  );

  // If the camera starts outside the range, bring it inside now.
  if (camera.radius < minDistance) {
    camera.radius = minDistance;
  } else if (camera.radius > maxDistance) {
    camera.radius = maxDistance;
  }

  // Attach the standard orbit controls: drag to orbit, wheel / pinch to zoom.
  const removeControls = attachControl(camera, canvas, scene);

  return () => {
    removeControls();
    removeLimits();
  };
}
