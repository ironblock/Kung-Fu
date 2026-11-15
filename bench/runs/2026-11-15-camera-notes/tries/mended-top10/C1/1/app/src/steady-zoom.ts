import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, right-drag to pan,
 * pinch to zoom) and replaces its wheel zoom with one whose step is a fixed distance.
 *
 * The library's wheel step is proportional to the camera's current radius. Here the
 * radius and wheelPrecision are read once, when this function is called, and every
 * notch uses those values, so later changes to the camera's radius do not change the
 * distance a notch moves it.
 *
 * The returned function removes every listener this function added.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Same formula as the library's default wheel, with the call-time radius fixed in.
    const stepScale = camera.radius / (camera.wheelPrecision * 1000);

    // Registered before attachControl, on window, in the capture phase. It runs before
    // any library listener for canvas wheel events, so it can stop the default wheel
    // zoom for this canvas only. Events from elsewhere pass through untouched.
    const onWheel = (event: WheelEvent): void => {
        if (event.target !== canvas) {
            return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        // Same sign and units as the library's default: inertialRadiusOffset -= deltaY * radius / (wheelPrecision * 1000).
        camera.inertialRadiusOffset -= event.deltaY * stepScale;
    };
    window.addEventListener("wheel", onWheel, { capture: true, passive: false });

    // Drag, right-drag pan and pinch come from the library. attachControl also adds a wheel
    // listener, but onWheel above stops those wheel events before they reach it.
    const detachControl = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        window.removeEventListener("wheel", onWheel, { capture: true });
        detachControl();
    };
}
