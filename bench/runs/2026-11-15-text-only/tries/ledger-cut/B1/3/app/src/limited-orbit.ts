import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Design notes (from camera-ledger.toml):
// - The clamp is applied by the camera's own radius setter through the limit hook
//   that setCameraLimits installs ("arc limits" rows). Input and inertia write radius
//   through that setter, so the range holds after each change, not just at the start
//   of a frame.
// - A per-frame callback is not used for the clamp. Callbacks added with onBeforeRender
//   run before the camera's controls apply inertia, so a clamp there would let the
//   radius leave the range for the rest of the frame.
// - Nothing is registered per frame by this module, so there is nothing to remove on
//   teardown beyond the canvas listeners and the limits.
//
// Not verified against the library source (not on this machine): the names
// setCameraLimits, lowerRadiusLimit, upperRadiusLimit, attachControl(canvas) and
// detachControl(canvas). The `scene` parameter is accepted to match the requested
// signature and is not used.

export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number,
): () => void {
  void scene;

  if (!(minDistance > 0) || !(maxDistance >= minDistance) || !Number.isFinite(maxDistance)) {
    throw new RangeError(
      `attachLimitedOrbit: need 0 < minDistance <= maxDistance (finite), got ${minDistance}..${maxDistance}`,
    );
  }

  const previousLower = camera.lowerRadiusLimit;
  const previousUpper = camera.upperRadiusLimit;

  camera.setCameraLimits({ lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance });

  // Bring a camera that starts outside the range inside now. Goes through the setter,
  // so the limit hook also applies.
  camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));

  camera.attachControl(canvas);

  let detached = false;
  return () => {
    if (detached) return;
    detached = true;
    camera.detachControl(canvas);
    camera.setCameraLimits({ lowerRadiusLimit: previousLower, upperRadiusLimit: previousUpper });
  };
}
