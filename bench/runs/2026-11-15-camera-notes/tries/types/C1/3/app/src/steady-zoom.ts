import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** Delta used for the one-notch probe. Only the library's response is read from it. */
const PROBE_DELTA_Y = 100;

/**
 * Attach the library's orbit controls to `canvas`, but replace the wheel zoom with
 * a fixed step per wheel notch.
 *
 * The step is measured once, at call time, by dispatching one synthetic notch
 * through the library's own wheel handler and reading what it did to the camera.
 * Each real notch then applies that same step, so the distance does not change
 * with the camera's later radius or target.
 *
 * Drag, right-drag pan, and pinch stay with the library. The returned function
 * detaches the library controls and the wheel override. It is safe to call twice.
 */
export function attachSteadyZoom(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    // Library controls first: their wheel listener is what the probe exercises.
    const detachLibrary = attachControl(camera, canvas, scene);

    // Probe one notch through the library's wheel handler, then restore the camera.
    const radiusBefore = camera.radius;
    const offsetBefore = camera.inertialRadiusOffset;
    const rect = canvas.getBoundingClientRect();
    canvas.dispatchEvent(
        new WheelEvent("wheel", {
            deltaY: PROBE_DELTA_Y,
            deltaMode: WheelEvent.DOM_DELTA_PIXEL,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
            bubbles: true,
            cancelable: true,
        }),
    );
    const stepOffset = camera.inertialRadiusOffset - offsetBefore;
    const stepRadius = camera.radius - radiusBefore;
    camera.inertialRadiusOffset = offsetBefore;
    camera.radius = radiusBefore;

    // The library's inertia path is preferred. If it wrote radius directly, use that.
    // If neither moved, the default wheel does nothing, so this one does nothing too.
    const useOffset = stepOffset !== 0;
    const step = useOffset ? stepOffset : stepRadius;

    // Capture on document so this runs before the library's canvas listener. Stopping
    // propagation there keeps the library's wheel handler from also zooming.
    // passive: false is required so preventDefault works.
    const onWheel = (event: WheelEvent): void => {
        if (event.target !== canvas) return;
        event.preventDefault();
        event.stopPropagation();
        if (event.deltaY === 0 || step === 0) return;
        const direction = event.deltaY > 0 ? 1 : -1;
        if (useOffset) {
            camera.inertialRadiusOffset += direction * step;
        } else {
            camera.radius += direction * step;
        }
    };
    document.addEventListener("wheel", onWheel, { capture: true, passive: false });

    let attached = true;
    return () => {
        if (!attached) return;
        attached = false;
        document.removeEventListener("wheel", onWheel, { capture: true });
        detachLibrary();
    };
}
