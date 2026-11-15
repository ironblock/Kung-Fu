import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Where a wheel step is written: directly to `radius`, or to the camera's
 * `inertialRadiusOffset` (so the library's own inertia applies it), matching
 * whichever the library's default wheel handler uses.
 */
type StepMode = "radius" | "offset";

interface WheelStep {
    mode: StepMode;
    /** Signed change for a wheel event with deltaY > 0 (the probe direction). */
    amount: number;
}

const PROBE_DELTA_Y = 100;

/**
 * Measures how far the library's default wheel handler moves a camera for one
 * notch, using a throwaway camera that is a copy of `camera` at this moment.
 * The real camera is never touched.
 */
function measureDefaultWheelStep(camera: ArcRotateCamera): WheelStep {
    const probe = createArcRotateCamera(camera.alpha, camera.beta, camera.radius, {
        x: camera.target.x,
        y: camera.target.y,
        z: camera.target.z,
    });
    probe.wheelPrecision = camera.wheelPrecision;

    const canvas = document.createElement("canvas");
    const detach = attachControl(probe, canvas);
    try {
        const radius0 = probe.radius;
        const offset0 = probe.inertialRadiusOffset;

        canvas.dispatchEvent(
            new WheelEvent("wheel", {
                deltaY: PROBE_DELTA_Y,
                deltaMode: WheelEvent.DOM_DELTA_PIXEL,
                bubbles: true,
                cancelable: true,
            }),
        );

        const dRadius = probe.radius - radius0;
        const dOffset = probe.inertialRadiusOffset - offset0;
        const radiusMoved = dRadius !== 0;
        const offsetMoved = dOffset !== 0;

        if (radiusMoved === offsetMoved) {
            throw new Error(
                `steady-zoom: could not determine the library's default wheel step (radius change ${dRadius}, offset change ${dOffset})`,
            );
        }
        const mode: StepMode = radiusMoved ? "radius" : "offset";
        const amount = radiusMoved ? dRadius : dOffset;
        if (!Number.isFinite(amount)) {
            throw new Error("steady-zoom: default wheel step is not a finite number");
        }
        return { mode, amount };
    } finally {
        detach();
    }
}

/**
 * Gives `camera` the library's usual orbit / pan / pinch controls on `canvas`,
 * but with wheel zoom moving the camera by a fixed distance per wheel event.
 * That distance is the library's default per-notch distance for the camera as
 * it is when this function is called; it does not change if the camera later
 * moves or changes radius.
 *
 * Returns a function that removes every listener this installed.
 */
export function attachSteadyZoom(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const step = measureDefaultWheelStep(camera);

    // Installed before attachControl, on window in the capture phase, so it runs
    // before the library's own wheel listeners and can stop them for events on
    // this canvas. Only the canvas's wheel events are affected.
    const onWheel = (ev: WheelEvent): void => {
        if (ev.target !== canvas) {
            return;
        }
        ev.preventDefault();
        ev.stopImmediatePropagation();

        const direction = Math.sign(ev.deltaY);
        if (direction === 0) {
            return;
        }
        const change = step.amount * direction;
        if (step.mode === "radius") {
            camera.radius += change;
        } else {
            camera.inertialRadiusOffset += change;
        }
    };

    window.addEventListener("wheel", onWheel, { capture: true, passive: false });

    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (err) {
        window.removeEventListener("wheel", onWheel, { capture: true });
        throw err;
    }

    return () => {
        window.removeEventListener("wheel", onWheel, { capture: true });
        detachControls();
    };
}
