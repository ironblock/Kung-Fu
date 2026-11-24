import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's orbit/pan/zoom controls to an ArcRotateCamera, with the
 * camera's radius (distance from its orbit target) clamped to
 * [minDistance, maxDistance].
 *
 * The radius clamp is installed through `setCameraLimits`, which snaps the
 * radius inside the camera's own setters, so it holds for wheel zoom, pinch
 * zoom and inertia alike. If the camera already sits outside the range, it is
 * moved inside as soon as this function is called.
 *
 * @returns A cleanup function that removes the canvas listeners, the inertia
 * hook and the radius clamp. Safe to call more than once.
 */
export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number,
): () => void {
  if (
    !Number.isFinite(minDistance) ||
    !Number.isFinite(maxDistance) ||
    minDistance <= 0 ||
    minDistance > maxDistance
  ) {
    throw new RangeError(
      `attachLimitedOrbit: expected 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
    );
  }

  const detachControls = attachControl(camera, canvas, scene);

  let disposeLimits: () => void;
  try {
    disposeLimits = setCameraLimits(camera, {
      lowerRadiusLimit: minDistance,
      upperRadiusLimit: maxDistance,
    });
  } catch (err) {
    detachControls();
    throw err;
  }

  let attached = true;
  return () => {
    if (!attached) return;
    attached = false;
    disposeLimits();
    detachControls();
  };
}
