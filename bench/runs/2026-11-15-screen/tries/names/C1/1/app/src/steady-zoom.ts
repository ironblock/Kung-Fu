import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

// Wheel delta used to probe the library's default notch size.
const PROBE_DELTA_Y = 100;

/**
 * Runs the library's own wheel handler once on the camera as it is right now
 * and returns how far one notch moves the radius (for a positive deltaY, i.e.
 * scrolling down). The camera is restored to its previous state afterwards.
 */
function measureDefaultNotchStep(camera: ArcRotateCamera, canvas: HTMLCanvasElement): number {
    const radius0 = camera.radius;
    const offset0 = camera.inertialRadiusOffset;

    canvas.dispatchEvent(
        new WheelEvent("wheel", {
            deltaY: PROBE_DELTA_Y,
            deltaMode: WheelEvent.DOM_DELTA_PIXEL,
            bubbles: true,
            cancelable: true,
        }),
    );

    const dRadius = camera.radius - radius0;
    const dOffset = camera.inertialRadiusOffset - offset0;

    camera.radius = radius0;
    camera.inertialRadiusOffset = offset0;

    // Prefer a direct radius change; otherwise use the inertial radius offset,
    // which the library applies to the radius over the following frames.
    const step = dRadius !== 0 ? dRadius : dOffset;
    if (!Number.isFinite(step) || step === 0) {
        throw new Error("steady-zoom: could not measure the library's default wheel step");
    }
    return step;
}

/**
 * Attaches the library's arc-rotate controls to `canvas`, but replaces its wheel
 * zoom with one that moves the radius by a fixed distance per notch: the distance
 * the default wheel gives on the camera as it is when this function is called.
 *
 * Returns a function that removes all listeners and detaches the controls.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Drag, right-drag pan, and pinch come from the library's controls.
    const detachLibrary = attachControl(camera, canvas, scene);

    let step: number;
    try {
        step = measureDefaultNotchStep(camera, canvas);
    } catch (error) {
        detachLibrary();
        throw error;
    }

    // The library's wheel listener sits on the canvas (or above it), so a window
    // capture listener sees the event first and can stop it before it reaches the
    // library. Only events targeted at this canvas are touched.
    const onWheel = (event: WheelEvent): void => {
        if (event.target !== canvas) {
            return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();

        if (event.deltaY === 0) {
            return;
        }

        let next = camera.radius + Math.sign(event.deltaY) * step;
        if (camera.lowerRadiusLimit !== undefined) {
            next = Math.max(next, camera.lowerRadiusLimit);
        }
        if (camera.upperRadiusLimit !== undefined) {
            next = Math.min(next, camera.upperRadiusLimit);
        }
        camera.radius = next;
    };

    window.addEventListener("wheel", onWheel, { capture: true, passive: false });

    return () => {
        window.removeEventListener("wheel", onWheel, { capture: true });
        detachLibrary();
    };
}
