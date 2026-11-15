import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * deltaY (pixels) of the synthetic wheel event used to measure what one notch
 * gives with the library's default controls. Browsers differ in what one notch
 * reports; 100 px is the common Chromium value. Adjust if your target differs.
 */
const MEASURE_NOTCH_DELTA_PX = 100;

/**
 * Gives an ArcRotateCamera the library's usual mouse and touch controls on
 * `canvas` (drag orbit, right-drag pan, pinch zoom), with wheel zoom replaced by
 * a fixed radius step per notch.
 *
 * The step is measured once, here, from the library's default wheel behaviour
 * on the camera as it is now. Every notch after that moves `camera.radius` by
 * that same amount, whatever the radius has become since. No per-frame hook is
 * registered by this module.
 *
 * Returns a cleanup function that removes the wheel listener and detaches the
 * library controls. It is safe to call more than once.
 */
export function attachSteadyZoom(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  let measuring = false;
  let stepRadius = 0;

  // Registered before attachControl, on the canvas, in the capture phase. At the
  // target, capture listeners run before bubble listeners, and among capture
  // listeners the earlier registration runs first, so this runs before the
  // library's wheel listener and can stop it.
  const onWheel = (event: WheelEvent): void => {
    if (measuring) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.deltaY === 0) return;
    camera.radius += Math.sign(event.deltaY) * stepRadius;
  };
  canvas.addEventListener("wheel", onWheel, { capture: true, passive: false });

  let detachControls: (() => void) | undefined;
  try {
    detachControls = attachControl(camera, canvas, scene);

    measuring = true;
    try {
      stepRadius = measureDefaultNotchRadius(camera, canvas);
    } finally {
      measuring = false;
    }
  } catch (error) {
    canvas.removeEventListener("wheel", onWheel, { capture: true });
    detachControls?.();
    throw error;
  }

  return () => {
    canvas.removeEventListener("wheel", onWheel, { capture: true });
    detachControls?.();
  };
}

/**
 * Dispatches one synthetic notch through the library's default wheel handler and
 * returns the radius change it implies, read from the inertial radius offset.
 * Restores the camera's offset and radius afterwards.
 *
 * ASSUMPTION (not verified against the library source, which is not on this
 * machine): the default wheel handler adds to `inertialRadiusOffset`, and the
 * library applies that offset to `radius` one-for-one with the sign reversed
 * (radius -= offset). Under that assumption, one notch's radius change for a
 * positive deltaY (wheel down, zoom out) is -offsetDelta.
 */
function measureDefaultNotchRadius(camera: ArcRotateCamera, canvas: HTMLCanvasElement): number {
  const offsetBefore = camera.inertialRadiusOffset;
  const radiusBefore = camera.radius;

  canvas.dispatchEvent(
    new WheelEvent("wheel", {
      deltaY: MEASURE_NOTCH_DELTA_PX,
      deltaMode: WheelEvent.DOM_DELTA_PIXEL,
      cancelable: true,
      bubbles: false,
    }),
  );

  const offsetDelta = camera.inertialRadiusOffset - offsetBefore;

  camera.inertialRadiusOffset = offsetBefore;
  camera.radius = radiusBefore;

  if (!Number.isFinite(offsetDelta) || offsetDelta === 0) {
    throw new Error(
      "attachSteadyZoom: the library's default wheel handler did not change inertialRadiusOffset; cannot measure the notch step.",
    );
  }
  return -offsetDelta;
}
