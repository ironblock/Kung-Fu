import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's arc-rotate controls to `canvas`, but replaces the
 * wheel zoom so that each wheel notch moves the camera a fixed distance.
 *
 * The library's own wheel handler subtracts deltaY * radius / (wheelPrecision * 1000)
 * from inertialRadiusOffset, so its steps grow and shrink with the current radius.
 * Here the per-deltaY distance is measured once, from the camera as it is when this
 * function is called, and reused for every later wheel event.
 *
 * Returns a function that removes every listener this added.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
  // Distance per unit of deltaY, using the library's default formula at call time.
  const offsetPerDeltaY = camera.radius / (camera.wheelPrecision * 1000);

  const onWheel = (event: WheelEvent): void => {
    // Keep the library's wheel handler (registered later on the canvas) from
    // running for this event, and stop the page from scrolling.
    event.preventDefault();
    event.stopImmediatePropagation();
    // Same sign convention as the library's default wheel handling.
    camera.inertialRadiusOffset -= event.deltaY * offsetPerDeltaY;
  };

  // Registered before attachControl so this listener runs first on the canvas.
  canvas.addEventListener("wheel", onWheel, { passive: false, capture: true });

  const detachControls = attachControl(camera, canvas, scene);

  return () => {
    canvas.removeEventListener("wheel", onWheel, { capture: true });
    detachControls();
  };
}
