import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's usual arc-rotate mouse and touch controls to `canvas`,
 * but makes each wheel notch move the camera by a fixed distance.
 *
 * The distance is what a notch gives with the library's default wheel handling
 * on the camera as it is when this function is called: the library subtracts
 * deltaY * radius / (wheelPrecision * 1000) from inertialRadiusOffset, so the
 * radius and wheelPrecision are captured here and used for every notch.
 *
 * Wheel events are taken over before they reach the canvas, so the library's
 * own wheel handling does not also run. Drag, right-drag pan and pinch are
 * still the library's.
 *
 * Returns a function that removes all listeners added here.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const referenceRadius = camera.radius;
    const referencePrecision = camera.wheelPrecision;

    const detachControls = attachControl(camera, canvas, scene);

    const onWheel = (event: WheelEvent): void => {
        if (event.target !== canvas) {
            return;
        }
        // Stop the event here so the library's canvas wheel listener never sees it.
        event.stopPropagation();
        event.preventDefault();
        // Same sign and formula the library uses, with the captured radius and precision.
        camera.inertialRadiusOffset -= (event.deltaY * referenceRadius) / (referencePrecision * 1000);
    };

    // Capture phase on window so this runs before the canvas listeners.
    window.addEventListener("wheel", onWheel, { capture: true, passive: false });

    return () => {
        window.removeEventListener("wheel", onWheel, { capture: true });
        detachControls();
    };
}
