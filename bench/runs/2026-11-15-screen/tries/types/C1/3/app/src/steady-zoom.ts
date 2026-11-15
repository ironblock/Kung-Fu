import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl } from "@babylonjs/lite";

/** Wheel delta that counts as one notch (the usual pixel-mode value for one mouse-wheel click). */
const NOTCH_DELTA_Y = 100;

/**
 * Measure how far one notch moves the camera with the library's default wheel handling,
 * in world units, for the camera's current pose and inertia settings.
 *
 * The library's own wheel handler is run against a detached canvas. Its effect is read
 * from `inertialRadiusOffset`, which is then scaled by the total settling factor
 * `1 / (1 - inertia)`, assuming each frame applies the offset and decays it by `inertia`.
 * The camera's offset is restored afterwards.
 */
function probeNotchDistance(camera: ArcRotateCamera, scene: SceneContext): number {
    const inertia = camera.inertia;
    if (!(inertia >= 0 && inertia < 1)) {
        throw new Error(`steady-zoom: cannot derive a notch distance with inertia ${inertia}`);
    }

    const savedOffset = camera.inertialRadiusOffset;
    camera.inertialRadiusOffset = 0;

    const probeCanvas = document.createElement("canvas");
    const detachProbe = attachControl(camera, probeCanvas, scene);
    let offset: number;
    try {
        probeCanvas.dispatchEvent(
            new WheelEvent("wheel", { deltaY: NOTCH_DELTA_Y, deltaMode: 0, cancelable: true }),
        );
        offset = Math.abs(camera.inertialRadiusOffset);
    } finally {
        detachProbe();
        camera.inertialRadiusOffset = savedOffset;
    }

    const perNotch = offset / (1 - inertia);
    if (!Number.isFinite(perNotch) || perNotch <= 0) {
        throw new Error("steady-zoom: the library's wheel handler produced no zoom to measure");
    }
    return perNotch;
}

/**
 * Attach the library's orbit controls to `camera` on `canvas`, but make wheel zoom move the
 * camera a fixed distance per notch.
 *
 * - Drag orbits, right-drag pans and pinch zooms through the library's own controls.
 * - Wheel is intercepted in the capture phase on `window` for events targeting `canvas`, so
 *   the library's wheel zoom never runs. Each notch changes `camera.radius` by the distance
 *   measured at call time, so it does not depend on the radius later.
 * - No per-frame hook is added by this module. The library's inertia hook is removed by the
 *   returned cleanup.
 *
 * @returns A cleanup that removes all listeners. It is safe to call more than once.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const perNotch = probeNotchDistance(camera, scene);

    const onWheel = (event: WheelEvent): void => {
        if (event.target !== canvas) {
            return;
        }
        // Stop the event before it reaches the library's own canvas wheel listener.
        event.preventDefault();
        event.stopImmediatePropagation();
        // Positive deltaY is wheel-down, which zooms out (larger radius).
        // deltaMode is not converted; line and page modes are treated as pixels.
        camera.radius += (event.deltaY / NOTCH_DELTA_Y) * perNotch;
    };

    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    const detachControls = attachControl(camera, canvas, scene);

    return () => {
        window.removeEventListener("wheel", onWheel, { capture: true });
        detachControls();
    };
}
