import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate controls to `canvas`, but with a
 * wheel zoom whose step is a fixed distance rather than a fraction of the
 * current radius.
 *
 * The library's wheel handler does
 *   inertialRadiusOffset -= deltaY * radius / (wheelPrecision * 1000)
 * so each notch scales with the radius at the time of the event. Here the
 * per-unit factor is captured once, from the camera as it is when this
 * function is called, and every later notch applies that same absolute amount.
 * The library's own wheel listener is blocked so the two never both run.
 *
 * Drag (orbit), right-drag (pan) and pinch are left to the library.
 *
 * Returns a function that removes every listener this installs.
 */
export function attachSteadyZoom(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    // Distance per unit of deltaY, using the default formula on the camera
    // as it is now. Frozen here so later moves of the camera do not change it.
    const distancePerDeltaY = camera.radius / (camera.wheelPrecision * 1000);

    const detachLibraryControls = attachControl(camera, canvas, scene);

    // Listen on window in the capture phase so this runs before the library's
    // canvas listener, and stop the event there for wheel events aimed at the canvas.
    const onWheel = (event: WheelEvent): void => {
        if (!event.composedPath().includes(canvas)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        // Same sign convention as the library: positive deltaY zooms out.
        camera.inertialRadiusOffset -= event.deltaY * distancePerDeltaY;
    };

    window.addEventListener("wheel", onWheel, { capture: true, passive: false });

    return () => {
        window.removeEventListener("wheel", onWheel, { capture: true });
        detachLibraryControls();
    };
}
