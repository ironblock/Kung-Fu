import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

/**
 * Attaches the library's orbit controls to `canvas`, but makes every wheel
 * notch move the camera by the same absolute distance toward or away from
 * its orbit target, regardless of the current radius.
 *
 * The per-notch distance is taken once, when this function is called, from
 * the library's default wheel step on the camera as it is then.
 * Returns a function that removes all listeners and any per-frame work.
 */
export function attachSteadyZoom(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    // Library drag / pan / pinch controls. Its wheel handling is suppressed below.
    const detachLibrary = attachControl(camera, canvas, scene);

    // Absolute distance one notch should move the camera, fixed at attach time.
    const stepDistance = measureDefaultWheelStep(camera);

    const onWheel = (event: WheelEvent): void => {
        event.preventDefault();
        // Keep the library's own wheel listener on this canvas from also zooming.
        event.stopImmediatePropagation();

        const notches = wheelNotches(event);
        if (notches === 0) return;

        // Radius is the distance from the camera to its orbit target.
        const next = camera.radius - notches * stepDistance;
        camera.radius = clampRadius(camera, next);
    };

    // Capture phase on the canvas fires before the library's listener on the
    // same element, so stopImmediatePropagation() blocks the library's zoom.
    const listenerOptions: AddEventListenerOptions = { capture: true, passive: false };
    canvas.addEventListener("wheel", onWheel, listenerOptions);

    return () => {
        canvas.removeEventListener("wheel", onWheel, listenerOptions);
        detachLibrary();
    };
}

/** Converts a wheel event to a signed number of notches (positive = zoom out). */
function wheelNotches(event: WheelEvent): number {
    // deltaMode 1 = lines (classic wheel: one notch is about 3 lines);
    // deltaMode 0 = pixels (about 100px per notch on common hardware).
    // These constants are assumptions, not taken from the library.
    if (event.deltaMode === 1) return event.deltaY / 3;
    return event.deltaY / 100;
}

function clampRadius(camera: ArcRotateCamera, radius: number): number {
    const lo = camera.lowerRadiusLimit ?? 0;
    const hi = camera.upperRadiusLimit ?? Infinity;
    return Math.min(hi, Math.max(lo, radius));
}

/**
 * Per-notch distance at the camera's current state.
 * ASSUMPTION: the library's default wheel step is radius-relative, about
 * `radius / wheelPrecision` per notch. The supplied declarations (camera-api.d.ts)
 * only document the fields; they do not state this formula. Verify it
 * against the library source before relying on it.
 */
function measureDefaultWheelStep(camera: ArcRotateCamera): number {
    const precision = camera.wheelPrecision > 0 ? camera.wheelPrecision : 1;
    return camera.radius / precision;
}
