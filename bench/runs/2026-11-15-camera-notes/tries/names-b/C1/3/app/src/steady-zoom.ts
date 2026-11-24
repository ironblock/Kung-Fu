import {
  attachControl,
  createArcRotateCamera,
  type ArcRotateCamera,
  type SceneContext,
} from "@babylonjs/lite";

// One mouse-wheel notch as browsers report it (pixel delta).
const NOTCH_DELTA_Y = 100;

/**
 * Signed change in camera.radius that the library's default wheel handling
 * gives for one notch (deltaY = +NOTCH_DELTA_Y), on a camera in the same
 * state as `camera` is right now. It is measured on a throwaway probe camera,
 * so the real camera is never touched.
 */
function measureNotchRadiusChange(camera: ArcRotateCamera, scene: SceneContext): number {
  const probeCanvas = document.createElement("canvas");
  const probe = createArcRotateCamera(
    camera.alpha,
    camera.beta,
    camera.radius,
    { ...camera.target } as ArcRotateCamera["target"],
  );
  probe.wheelPrecision = camera.wheelPrecision;

  const startRadius = probe.radius;
  const startOffset = probe.inertialRadiusOffset;
  const detachProbe = attachControl(probe, probeCanvas, scene);
  try {
    probeCanvas.dispatchEvent(
      new WheelEvent("wheel", {
        deltaY: NOTCH_DELTA_Y,
        deltaMode: WheelEvent.DOM_DELTA_PIXEL,
        bubbles: true,
        cancelable: true,
      }),
    );
    // The library may apply the notch to radius directly or queue it in
    // inertialRadiusOffset; count both.
    const change =
      probe.radius - startRadius + (probe.inertialRadiusOffset - startOffset);
    if (!Number.isFinite(change) || change === 0) {
      throw new Error(
        "steady-zoom: default wheel handling did not change the radius synchronously; cannot measure the notch distance",
      );
    }
    return change;
  } finally {
    detachProbe();
  }
}

/**
 * Attaches the library's default arc-rotate controls to `canvas` (drag to
 * orbit, right-drag to pan, pinch to zoom), but replaces wheel zoom with a
 * fixed world distance per notch. The distance is measured once, from the
 * camera's state at call time, and stays the same however the radius changes
 * afterwards. Returns a function that removes all listeners.
 */
export function attachSteadyZoom(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const notchChange = measureNotchRadiusChange(camera, scene);

  const onWheel = (event: WheelEvent): void => {
    if (event.target !== canvas) return;
    // Keep the library's own wheel handler (on the canvas) from also zooming.
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.deltaY === 0) return;

    let radius = camera.radius + Math.sign(event.deltaY) * notchChange;
    if (camera.lowerRadiusLimit !== undefined) {
      radius = Math.max(camera.lowerRadiusLimit, radius);
    }
    if (camera.upperRadiusLimit !== undefined) {
      radius = Math.min(camera.upperRadiusLimit, radius);
    }
    camera.radius = radius;
  };

  // Registered before attachControl, in the window capture phase, so it runs
  // before any wheel listener the library installs.
  window.addEventListener("wheel", onWheel, { capture: true, passive: false });
  const detachControls = attachControl(camera, canvas, scene);

  return () => {
    window.removeEventListener("wheel", onWheel, { capture: true });
    detachControls();
  };
}
