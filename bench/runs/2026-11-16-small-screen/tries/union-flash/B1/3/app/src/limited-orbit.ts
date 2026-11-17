import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number,
): () => void {
  // Be defensive if the caller supplies the bounds swapped.
  const lowerRadiusLimit = Math.min(minDistance, maxDistance);
  const upperRadiusLimit = Math.max(minDistance, maxDistance);

  const savedLowerRadiusLimit = camera.lowerRadiusLimit;
  const savedUpperRadiusLimit = camera.upperRadiusLimit;

  const restoreRadiusLimits = () => {
    if (savedLowerRadiusLimit === undefined) {
      delete camera.lowerRadiusLimit;
    } else {
      camera.lowerRadiusLimit = savedLowerRadiusLimit;
    }

    if (savedUpperRadiusLimit === undefined) {
      delete camera.upperRadiusLimit;
    } else {
      camera.upperRadiusLimit = savedUpperRadiusLimit;
    }
  };

  // Attach the library's usual pointer/wheel/touch controls. Keyboard controls are
  // disabled so the returned dispose leaves no canvas key listeners.
  const disposeControls = attachControl(camera, canvas, scene, { keyboard: false });

  // setCameraLimits is needed because merely setting radius limit fields does not
  // clamp writes. Once active, every radius write is clamped, including wheel/pinch
  // writes, and hitting a bound zeroes the radius inertial offset. Calling it after
  // attachControl keeps it as the latest limits installer if controls install defaults.
  let disposeRadiusLimits: () => void = () => {};
  try {
    disposeRadiusLimits = setCameraLimits(
      camera,
      { lowerRadiusLimit, upperRadiusLimit },
      scene,
    );
  } catch (error) {
    try {
      disposeControls();
    } catch {
      // Continue to cleanup even if control disposal fails.
    }
    restoreRadiusLimits();
    throw error;
  }

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;

    try {
      disposeControls();
    } finally {
      try {
        disposeRadiusLimits();
      } finally {
        restoreRadiusLimits();
      }
    }
  };
}
