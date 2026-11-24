import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Gives the arc-rotate camera the library's usual mouse and touch controls
 * on `canvas` (drag to orbit, wheel and two-finger pinch to zoom), while
 * keeping its distance from the orbit target within [minDistance, maxDistance]
 * at all times.
 *
 * Returns a function that removes the controls: no listeners left on the
 * canvas and nothing left running each frame.
 */
export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number,
): () => void {
  // The library's standard controls. Passing `scene` is required for the
  // drag/wheel inertial steps to actually move the camera each frame.
  const detachControls = attachControl(camera, canvas, scene);

  // Enforce the zoom range via the radius limits:
  //  - the call clamps the current pose at once, so a camera that starts
  //    outside the range is brought inside immediately;
  //  - from then on every radius write that changes the value is clamped in
  //    the same statement, which covers both the wheel's per-frame inertial
  //    step (radius -= inertialRadiusOffset) and the pinch's direct radius
  //    writes, and the inertial radius offset is zeroed when a bound is hit,
  //    so hard scrolling/pinching cannot carry the camera past the limits.
  const stopClamping = setCameraLimits(
    camera,
    { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
    scene,
  );

  let removed = false;
  return () => {
    if (removed) return;
    removed = true;
    detachControls(); // removes the canvas listeners and the per-frame step
    stopClamping();   // stops the per-write clamping (limit fields are left set)
  };
}
