import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's default arc-rotate controls to `canvas`, but makes
 * each wheel event move the camera by a fixed distance toward or away from the
 * orbit target, independent of the radius the camera has at that moment.
 *
 * The library's wheel step is `deltaY * radius / (wheelPrecision * 1000)`.
 * The step therefore grows with the radius. Before each wheel event reaches
 * the canvas we set `wheelPrecision` to `refPrecision * radius / refRadius`,
 * which makes the step equal `deltaY * refRadius / (refPrecision * 1000)`:
 * exactly what the default controls would give on the camera as it was when
 * this function was called. The original `wheelPrecision` is restored once the
 * event has been dispatched. Nothing runs per frame.
 *
 * Returns a function that removes the controls and every listener we added.
 */
export function attachSteadyZoom(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  // Reference state, as the camera is when this function is called.
  const refRadius = camera.radius;
  const refPrecision = camera.wheelPrecision;

  const detachControls = attachControl(camera, canvas, scene);

  const win: Window = canvas.ownerDocument.defaultView ?? window;

  // The precision value the app had before we overrode it, or null when we
  // have not overridden it for the event in progress.
  let savedPrecision: number | null = null;

  const restorePrecision = (): void => {
    if (savedPrecision !== null) {
      camera.wheelPrecision = savedPrecision;
      savedPrecision = null;
    }
  };

  const isOnCanvas = (target: EventTarget | null): boolean =>
    target instanceof Node && canvas.contains(target);

  // Capture phase on the window runs before the library's canvas listener.
  const onWheelCapture = (event: WheelEvent): void => {
    restorePrecision();
    if (!isOnCanvas(event.target)) return;

    const radius = camera.radius;
    if (!(radius > 0) || !(refRadius > 0) || !(refPrecision > 0)) return;

    savedPrecision = camera.wheelPrecision;
    camera.wheelPrecision = (refPrecision * radius) / refRadius;
  };

  // Bubble phase on the window runs after the library's canvas listener.
  const onWheelBubble = (): void => {
    restorePrecision();
  };

  win.addEventListener("wheel", onWheelCapture, { capture: true });
  win.addEventListener("wheel", onWheelBubble);

  return () => {
    win.removeEventListener("wheel", onWheelCapture, { capture: true });
    win.removeEventListener("wheel", onWheelBubble);
    restorePrecision();
    detachControls();
  };
}
