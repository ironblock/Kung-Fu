import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Gives `camera` the library's usual mouse and touch controls on `canvas`
 * (drag to orbit, right-drag to pan, wheel and pinch to zoom). The wheel is
 * changed so that each notch moves the camera a fixed distance along its
 * radius, wherever it is.
 *
 * That distance is the one a notch gives with the default controls on the
 * camera as it is now. With the default controls, a wheel event does
 *   inertialRadiusOffset -= deltaY * radius / (wheelPrecision * 1000)
 * using the radius at that moment, so the steps grow and shrink with the
 * radius. Here the same step is applied, but with the radius and
 * wheelPrecision fixed at their values at call time. The library's frame
 * step still applies the offset and its inertia, so a notch coasts the same
 * way it does by default, just by the same total distance every time.
 *
 * Returns a function that removes the controls.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const offsetPerDeltaY = camera.radius / (camera.wheelPrecision * 1000);

    const onWheel = (event: WheelEvent): void => {
        // Keep the library's own radius-proportional wheel handler from running.
        event.stopImmediatePropagation();
        event.preventDefault();
        camera.inertialRadiusOffset -= event.deltaY * offsetPerDeltaY;
    };

    // Added before attachControl so this listener runs first. A capture listener
    // on the canvas runs ahead of the library's canvas listener whether that one
    // is a capture or a bubble listener.
    const wheelOptions: AddEventListenerOptions = { capture: true, passive: false };
    canvas.addEventListener("wheel", onWheel, wheelOptions);

    let detachControls: () => void;
    try {
        // The scene is required: without it the library never applies the offsets.
        detachControls = attachControl(camera, canvas, scene);
    } catch (error) {
        canvas.removeEventListener("wheel", onWheel, wheelOptions);
        throw error;
    }

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        canvas.removeEventListener("wheel", onWheel, wheelOptions);
        // Removes the library's canvas listeners and its per-frame step.
        detachControls();
    };
}
