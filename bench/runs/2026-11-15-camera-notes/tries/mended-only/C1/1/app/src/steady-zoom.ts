import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Gives an ArcRotateCamera the library's mouse and touch controls on `canvas`
 * (drag to orbit, right-drag to pan, pinch to zoom), with a wheel zoom that
 * moves a fixed distance per wheel event.
 *
 * The library's own wheel zoom scales each step with the current radius
 * (inertialRadiusOffset -= deltaY * radius / (wheelPrecision * 1000)). Here the
 * radius and wheelPrecision are read once, when this function is called, and
 * every wheel event then moves the radius by deltaY * radiusAtAttach /
 * (wheelPrecision * 1000), with no inertia. The library's wheel listener is
 * blocked so the two never both apply.
 *
 * Returns a function that removes every listener this attached.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
  // Captured once: the distance a notch gives with the library's default wheel
  // on the camera as it is now, independent of later moves.
  const radiusPerWheelUnit = camera.radius / (camera.wheelPrecision * 1000);

  const onWheel = (event: WheelEvent): void => {
    // Capture phase on the canvas runs before the library's own wheel listener;
    // stopping here keeps the library from zooming a second time.
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.deltaY === 0) {
      return;
    }
    // Positive deltaY moves the camera out, as in the library.
    camera.radius = Math.max(0.01, camera.radius + event.deltaY * radiusPerWheelUnit);
  };

  // Registered before attachControl, so it also comes first in bubble order on
  // browsers that run target listeners in registration order.
  canvas.addEventListener("wheel", onWheel, { capture: true, passive: false });

  const detachLibraryControls = camera.attachControl(canvas, scene);

  return (): void => {
    canvas.removeEventListener("wheel", onWheel, { capture: true });
    detachLibraryControls();
  };
}
