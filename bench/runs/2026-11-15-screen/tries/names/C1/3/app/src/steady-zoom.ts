import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** Size of the synthetic wheel event used to measure the library's default notch step. */
const PROBE_DELTA_Y = 100;

/**
 * Attaches the library's default arc-rotate controls (orbit, pan, pinch) and replaces
 * its wheel zoom with a fixed-distance step per wheel notch.
 *
 * The per-notch step is measured once, at call time, by running the library's own
 * wheel handler on a probe event and restoring the camera afterwards. The step is an
 * absolute distance in radius units, so it does not change as the camera moves.
 *
 * Returns a function that removes every listener this installs.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const notchStep = measureDefaultNotchStep(camera, canvas, scene);

    // Installs the library's orbit/pan/pinch and (its own) wheel handling on the canvas.
    const disposeLibraryControls = attachControl(camera, canvas, scene);

    // The library's wheel handler is on the canvas itself. Intercept wheel events for
    // this canvas during the capture phase on window so the library never sees them.
    const onWheel = (event: WheelEvent): void => {
        if (!event.composedPath().includes(canvas)) {
            return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.deltaY === 0) {
            return;
        }
        applyRadiusChange(camera, notchStep * Math.sign(event.deltaY));
    };

    window.addEventListener("wheel", onWheel, { capture: true, passive: false });

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        window.removeEventListener("wheel", onWheel, { capture: true });
        disposeLibraryControls();
    };
}

/**
 * Returns the signed change in camera radius that the library's default wheel handler
 * produces for one notch of PROBE_DELTA_Y (positive deltaY), in radius units.
 * The camera is restored to its prior state before returning.
 */
function measureDefaultNotchStep(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): number {
    const radius0 = camera.radius;
    const offset0 = camera.inertialRadiusOffset;

    const disposeProbe = attachControl(camera, canvas, scene);
    let step: number;
    try {
        canvas.dispatchEvent(
            new WheelEvent("wheel", { deltaY: PROBE_DELTA_Y, deltaMode: 0, bubbles: true, cancelable: true }),
        );
        // The library may apply the zoom immediately to radius or defer it through the
        // inertial offset; count both.
        step = camera.radius - radius0 + (camera.inertialRadiusOffset - offset0);
    } finally {
        disposeProbe();
        camera.radius = radius0;
        camera.inertialRadiusOffset = offset0;
    }

    if (!Number.isFinite(step) || step === 0) {
        throw new Error("steady-zoom: could not measure the library's default wheel step for this camera");
    }
    return step;
}

function applyRadiusChange(camera: ArcRotateCamera, change: number): void {
    let radius = camera.radius + change;
    if (camera.upperRadiusLimit !== undefined) {
        radius = Math.min(radius, camera.upperRadiusLimit);
    }
    if (camera.lowerRadiusLimit !== undefined) {
        radius = Math.max(radius, camera.lowerRadiusLimit);
    }
    camera.radius = radius;
    camera._clampToLimits?.();
}
