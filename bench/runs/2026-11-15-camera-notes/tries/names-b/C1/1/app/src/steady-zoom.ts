import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// UNVERIFIED ASSUMPTION: the distance one wheel notch moves the camera with the
// library's default controls, as a fraction of the radius. The library source is not
// on this machine and camera-api.d.ts does not state this value. Set it to the value
// the library actually uses before relying on this module.
const LIBRARY_NOTCH_FRACTION = 0.1;

/**
 * Orbit/pan/pinch use the library's mouse and touch controls. Wheel zoom is replaced
 * by a fixed radius step per notch, measured once when this is called.
 * Returns a function that removes every listener this attached.
 */
export function attachSteadyZoom(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    // Distance of one notch, fixed for the life of this attachment.
    const notch = camera.radius * LIBRARY_NOTCH_FRACTION;

    // Our wheel listener is registered before the library's so that, when the
    // library listens on the canvas, the capture listener still runs first and can stop it.
    const onWheel = (event: WheelEvent): void => {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.deltaY === 0) {
            return;
        }
        const direction = event.deltaY < 0 ? -1 : 1; // wheel up zooms in
        let radius = camera.radius + direction * notch;
        // Read the limits at each notch, since the app may change them.
        if (camera.lowerRadiusLimit !== undefined) {
            radius = Math.max(camera.lowerRadiusLimit, radius);
        }
        if (camera.upperRadiusLimit !== undefined) {
            radius = Math.min(camera.upperRadiusLimit, radius);
        }
        camera.radius = radius;
    };
    canvas.addEventListener("wheel", onWheel, { capture: true, passive: false });

    const detachLibraryControls = attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
    });

    return () => {
        canvas.removeEventListener("wheel", onWheel, { capture: true });
        detachLibraryControls();
    };
}
