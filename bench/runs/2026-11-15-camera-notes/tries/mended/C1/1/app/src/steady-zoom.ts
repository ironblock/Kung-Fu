import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls to `canvas`, but with wheel
 * zoom that moves a fixed distance per notch.
 *
 * The library's own wheel handler moves the camera by an amount proportional to
 * the current radius. Here the wheel handler is replaced: the distance per notch
 * is taken once, now, from the radius and wheelPrecision the camera has when
 * this function is called, and every notch adds that same offset to
 * `inertialRadiusOffset`, which the library applies with its usual inertia.
 *
 * Drag-to-orbit, right-drag pan and pinch zoom are still the library's.
 *
 * Returns a function that removes every listener this attached.
 */
export function attachSteadyZoom(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    // Distance per unit of wheel deltaY, as the library's default controls would give it now.
    const radiusPerDeltaY = camera.radius / (camera.wheelPrecision * 1000);

    const onWheel = (event: WheelEvent): void => {
        // Stop the library's own wheel handler on the canvas from running.
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.deltaY !== 0) {
            // Same sign convention as the library: positive deltaY zooms out.
            camera.inertialRadiusOffset -= event.deltaY * radiusPerDeltaY;
        }
    };

    // Added before attachControl, in capture phase, so this listener runs ahead of the library's.
    canvas.addEventListener("wheel", onWheel, { capture: true, passive: false });
    const detachControls = attachControl(camera, canvas, scene);

    return () => {
        canvas.removeEventListener("wheel", onWheel, { capture: true });
        detachControls();
    };
}
