import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

type FrameHook = () => void;

/**
 * Gives `camera` the library's standard orbit controls on `canvas` (drag to
 * orbit, wheel / pinch to zoom) and keeps its radius - the distance to the
 * point it orbits - within [minDistance, maxDistance] on every frame.
 *
 * Why not just an onBeforeRender clamp: onBeforeRender puts callbacks at the
 * head of scene._beforeRender, while attachControl pushes its inertia/zoom
 * hook onto the tail, and the scene walks the list head to tail. A clamp
 * registered via onBeforeRender would therefore run *before* that frame's
 * zoom step and the frame would render out of range. Instead we push our
 * clamp onto the tail after attachControl, so it runs after the zoom step.
 *
 * Returns a disposer that removes the canvas listeners and our frame hook.
 */
export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number,
): () => void {
  if (!(Number.isFinite(minDistance) && Number.isFinite(maxDistance))) {
    throw new RangeError("attachLimitedOrbit: minDistance and maxDistance must be finite numbers");
  }
  if (minDistance < 0 || minDistance > maxDistance) {
    throw new RangeError("attachLimitedOrbit: require 0 <= minDistance <= maxDistance");
  }

  const clampRadius = (): void => {
    const r = camera.radius;
    if (r < minDistance) {
      camera.radius = minDistance;
    } else if (r > maxDistance) {
      camera.radius = maxDistance;
    } else if (Number.isNaN(r)) {
      camera.radius = minDistance;
    }
  };

  // Mirror the range into the camera's radius limit fields. On their own they
  // do not clamp anything, but interpolateArcRotateCamera reads them to clamp
  // its goal, so an animated move will not fight our per-frame clamp (which
  // would otherwise make that interpolation reject). Restored on dispose.
  const cam = camera as ArcRotateCamera & {
    lowerRadiusLimit: number | null | undefined;
    upperRadiusLimit: number | null | undefined;
  };
  const prevLower = cam.lowerRadiusLimit;
  const prevUpper = cam.upperRadiusLimit;
  cam.lowerRadiusLimit = minDistance;
  cam.upperRadiusLimit = maxDistance;

  // Bring the camera into range right away.
  clampRadius();

  // Standard mouse/touch controls. The scene must be passed, otherwise the
  // input only accumulates inertia that is never applied.
  const detachControls = attachControl(camera, canvas, scene);

  // Our clamp goes on the tail, after attachControl's own hook.
  const hooks = (scene as unknown as { _beforeRender: FrameHook[] })._beforeRender;
  hooks.push(clampRadius);

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;

    detachControls();

    const i = hooks.indexOf(clampRadius);
    if (i !== -1) hooks.splice(i, 1);

    // Only restore the limit fields if nobody changed them in the meantime.
    if (cam.lowerRadiusLimit === minDistance) cam.lowerRadiusLimit = prevLower;
    if (cam.upperRadiusLimit === maxDistance) cam.upperRadiusLimit = prevUpper;
  };
}
