import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** Deltas used for the probe: one "notch" = one wheel event, whatever its size. */
const PROBE_DELTA_Y = 100;

/**
 * Measure how far the library's default wheel handling moves the radius for one
 * notch, using a scratch camera that copies the real camera's current pose and
 * wheel-relevant settings. The scratch camera and its canvas are discarded.
 *
 * Assumption: the library accumulates a wheel notch into `inertialRadiusOffset`
 * synchronously, and that offset is the radius change in world units.
 */
function measureDefaultNotchDistance(camera: ArcRotateCamera, scene: SceneContext): number {
    const probeCanvas = document.createElement("canvas");
    const probe = createArcRotateCamera(camera.alpha, camera.beta, camera.radius, {
        x: camera.target.x,
        y: camera.target.y,
        z: camera.target.z,
    });
    probe.inertia = camera.inertia;
    probe.wheelPrecision = camera.wheelPrecision;

    const detachProbe = attachControl(probe, probeCanvas, scene);
    let step: number;
    try {
        probeCanvas.dispatchEvent(new WheelEvent("wheel", { deltaY: PROBE_DELTA_Y, cancelable: true }));
        step = Math.abs(probe.inertialRadiusOffset);
    } finally {
        detachProbe();
    }

    if (!Number.isFinite(step) || step <= 0) {
        throw new Error("steady-zoom: could not measure the default wheel distance for this camera");
    }
    return step;
}

/**
 * Attach the library's orbit controls to `camera` and replace its wheel zoom with
 * a fixed world-unit step per wheel event. The step is measured once, when this
 * function is called, so each notch moves the camera the same distance toward or
 * away from its target however far the camera is from it later.
 *
 * Drag-to-orbit, right-drag pan and pinch zoom stay with the library.
 *
 * @returns A cleanup function that removes every listener this call added. Safe to
 *   call more than once.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const step = measureDefaultNotchDistance(camera, scene);

    const detachControls = attachControl(camera, canvas, scene);

    // Capture on window so this runs before the library's canvas wheel listener;
    // stopPropagation keeps the event from reaching the canvas, so the library
    // never applies its own zoom to it.
    const onWheel = (event: WheelEvent): void => {
        if (event.target !== canvas) {
            return;
        }
        event.stopPropagation();
        event.preventDefault();
        if (event.deltaY === 0) {
            return;
        }
        // Direct write, no inertia and no per-frame hook. The radius setter applies
        // any limits set on the camera.
        camera.radius += event.deltaY > 0 ? step : -step;
    };
    window.addEventListener("wheel", onWheel, { capture: true, passive: false });

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        window.removeEventListener("wheel", onWheel, { capture: true });
        detachControls();
    };
}
