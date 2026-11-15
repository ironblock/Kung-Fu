import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// The library's minimum radius (see camera-notes.md, item 13).
const MIN_RADIUS = 0.01;

/**
 * Attaches the library's standard orbit controls to `camera` on `canvas`, but
 * replaces the wheel zoom with one that moves the camera a fixed distance per
 * unit of wheel deltaY, regardless of the current radius.
 *
 * The distance is taken from the camera as it is when this function is called:
 * the library's default wheel zoom at that radius, wheelPrecision and inertia.
 *
 * Returns a function that removes every listener this installs.
 */
export function attachSteadyZoom(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  // Snapshot the default zoom at call time. The library's wheel adds
  // deltaY * radius / (wheelPrecision * 1000) to inertialRadiusOffset, and the
  // frame step applies that offset and then multiplies it by inertia, so one
  // event's total radius change is offset / (1 - inertia).
  const startRadius = camera.radius;
  const wheelPrecision = camera.wheelPrecision;
  const inertia = camera.inertia;
  const coast = inertia < 1 ? 1 / (1 - inertia) : 1;
  const radiusPerDeltaY = (startRadius / (wheelPrecision * 1000)) * coast;

  const onWheel = (event: WheelEvent): void => {
    // Stop the library's own wheel handler from also zooming. It scales by the
    // current radius, which is what we are avoiding. The capture listener is
    // registered before attachControl, so it runs first on the canvas.
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.deltaY === 0) {
      return;
    }
    // Positive deltaY zooms out, as in the library.
    camera.radius = Math.max(MIN_RADIUS, camera.radius + event.deltaY * radiusPerDeltaY);
  };

  canvas.addEventListener("wheel", onWheel, { capture: true, passive: false });
  const detachControls = attachControl(camera, canvas, scene);

  return () => {
    detachControls();
    canvas.removeEventListener("wheel", onWheel, { capture: true });
  };
}
