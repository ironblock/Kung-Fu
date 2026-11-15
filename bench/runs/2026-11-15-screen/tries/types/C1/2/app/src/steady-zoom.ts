import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** Smallest radius we will write ourselves; keeps the camera from flipping through the target. */
const MIN_RADIUS = 1e-3;

/** One standard mouse-wheel notch in pixel mode. */
const PROBE_DELTA_Y = 100;

/**
 * Attach the library's orbit controls to `camera` and replace its wheel zoom with
 * a fixed-distance zoom: every wheel notch moves the camera by the same absolute
 * distance, equal to what one notch gives with the library's default wheel
 * handling on the camera as it is now.
 *
 * Drag-to-orbit, right-drag pan, and pinch-zoom remain the library's own.
 *
 * @returns Removes all listeners and the library's per-frame inertia hook. Safe to call more than once.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Library controls: orbit, pan, pinch, and its own wheel handler (suppressed below).
    const detachLibrary = attachControl(camera, canvas, scene);

    let notchDistance: number;
    let notchDirection: number;
    try {
        // Calibrate by dispatching one notch through the library's wheel handler.
        // It accumulates into inertialRadiusOffset, which decays by `inertia` per frame,
        // so the total radius change of one notch is offset / (1 - inertia).
        const savedOffset = camera.inertialRadiusOffset;
        camera.inertialRadiusOffset = 0;
        canvas.dispatchEvent(new WheelEvent("wheel", { deltaY: PROBE_DELTA_Y, deltaMode: 0, bubbles: true, cancelable: true }));
        const probeOffset = camera.inertialRadiusOffset;
        camera.inertialRadiusOffset = savedOffset;

        if (!(camera.inertia < 1)) {
            throw new Error("steady-zoom: camera.inertia must be below 1 to calibrate the wheel step");
        }
        const notchRadius = probeOffset / (1 - camera.inertia);
        if (!Number.isFinite(notchRadius) || notchRadius === 0) {
            throw new Error("steady-zoom: the library's wheel handler produced no zoom on this camera");
        }
        notchDistance = Math.abs(notchRadius);
        // Direction that a positive deltaY produces with the library's default controls.
        notchDirection = Math.sign(notchRadius);
    } catch (err) {
        detachLibrary();
        throw err;
    }

    // Our wheel handler. Listening on the document in the capture phase means it runs
    // before any listener on the canvas, so stopPropagation keeps the library's wheel
    // handler from seeing wheel events aimed at the canvas.
    const doc = canvas.ownerDocument;
    const onWheel = (event: WheelEvent): void => {
        if (event.target !== canvas) return;
        event.preventDefault();
        event.stopPropagation();
        if (event.deltaY === 0) return;
        const step = Math.sign(event.deltaY) * notchDirection * notchDistance;
        camera.radius = Math.max(camera.radius + step, MIN_RADIUS);
    };
    doc.addEventListener("wheel", onWheel, { capture: true, passive: false });

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        doc.removeEventListener("wheel", onWheel, { capture: true });
        detachLibrary();
    };
}
