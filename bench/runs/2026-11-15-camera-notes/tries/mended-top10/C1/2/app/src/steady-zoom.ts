import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

/**
 * Attaches the library's default arc-rotate controls to the canvas, but makes
 * each mouse-wheel notch move the camera a fixed distance toward or away from
 * its target, regardless of the current radius.
 *
 * The library's wheel handler adds deltaY * radius / (wheelPrecision * 1000)
 * to inertialRadiusOffset, so its step shrinks and grows with the radius.
 * Here the per-unit factor is measured once, from the camera as it is when
 * this function is called, and then held constant.
 *
 * Drag (orbit), right-drag (pan) and pinch are left to the library.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Offset change per unit of deltaY that the library's default wheel would produce
    // on the camera as it is now. Held fixed from here on.
    const offsetPerDeltaY = camera.radius / (camera.wheelPrecision * 1000);

    const detachDefaultControls = attachControl(camera, canvas, scene);

    // Capture phase on window runs before the library's listener on the canvas, so
    // stopping propagation keeps the library's radius-scaled wheel handling from
    // running for this event. Passive must be false so preventDefault takes effect.
    const onWheel = (event: WheelEvent): void => {
        if (event.target !== canvas) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        // Same sign convention as the library's wheel handler.
        camera.inertialRadiusOffset -= event.deltaY * offsetPerDeltaY;
    };
    window.addEventListener("wheel", onWheel, { capture: true, passive: false });

    return () => {
        window.removeEventListener("wheel", onWheel, { capture: true });
        detachDefaultControls();
    };
}
