import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Smallest radius the library's default wheel zoom will go down to.
const MIN_RADIUS = 0.01;

/**
 * Gives an arc-rotate camera the library's usual mouse and touch controls on
 * `canvas` (drag to orbit, right-drag to pan, pinch to zoom), but replaces the
 * wheel zoom so that every wheel event moves the camera by the same distance,
 * whatever its radius is now.
 *
 * The distance is what the library's default wheel would give on the camera
 * as it is when this function is called: the library moves the radius by
 * deltaY * radius / (wheelPrecision * 1000) per event, and coasts that offset
 * down by `inertia` each frame, so one event's total is that offset divided
 * by (1 - inertia). Here the radius is fixed at its value at call time.
 *
 * Returns a function that removes every listener this added, including the
 * library's controls.
 */
export function attachSteadyZoom(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const precision = camera.wheelPrecision;
    const inertia = camera.inertia;
    if (!(precision > 0) || !(inertia >= 0 && inertia < 1)) {
        throw new Error("attachSteadyZoom: camera has no usable wheelPrecision/inertia");
    }
    // Distance moved per unit of deltaY, fixed at the radius the camera has now.
    const distancePerDeltaY = camera.radius / (precision * 1000) / (1 - inertia);

    // Library controls for drag, pan and pinch. The keyboard is left off.
    const detachLibraryControls = camera.attachControl(canvas, { keyboard: false }, scene);

    // The library's own wheel handler is on the canvas. Handling the event here,
    // in the window's capture phase, stops it from reaching the canvas, so the
    // library never zooms by wheel. Other canvas events are not affected.
    const onWheel = (event: WheelEvent) => {
        if (event.target !== canvas) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        camera.radius = Math.max(MIN_RADIUS, camera.radius + event.deltaY * distancePerDeltaY);
    };
    window.addEventListener("wheel", onWheel, { capture: true, passive: false });

    return () => {
        window.removeEventListener("wheel", onWheel, { capture: true });
        detachLibraryControls();
    };
}
