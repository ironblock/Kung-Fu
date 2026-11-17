import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

export function attachFastOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const originalAngularSensibility = camera.angularSensibility;

  // The library's standard arc-rotate pointer drag uses:
  //   inertialAlphaOffset -= dx / angularSensibility
  //   inertialBetaOffset  -= dy / angularSensibility
  // and applies those offsets through the scene frame hook, so the inertia
  // glide is also driven by the same offsets. Halving angularSensibility
  // therefore doubles both horizontal and vertical rotation for the same
  // pointer movement, including the glide after release, while leaving wheel
  // zoom, pinch zoom, and pan sensitivity untouched.
  camera.angularSensibility = originalAngularSensibility / 2;

  // Standard mouse/touch controls only; do not attach keyboard controls.
  const dispose = attachControl(camera, canvas, scene, { keyboard: false });

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;

    // Remove the library's canvas listeners and scene-frame hook first, then
    // restore the camera field so nothing of ours remains.
    dispose();
    camera.angularSensibility = originalAngularSensibility;
  };
}
