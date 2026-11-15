import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// The library clamps radius to at least this after a wheel zoom.
const MIN_RADIUS = 0.01;

/**
 * Attaches the library's arc-rotate controls to `canvas`, but replaces the
 * wheel zoom so that each wheel event moves the camera by a fixed world
 * distance, independent of the current radius.
 *
 * The per-event distance is the one the library's default wheel handler gives
 * for the camera as it is now: the library adds deltaY * radius /
 * (wheelPrecision * 1000) to the radius offset, and that offset is spread over
 * later frames (each frame adds it and multiplies it by `inertia`), so the
 * total movement is offset / (1 - inertia). The radius, wheelPrecision and
 * inertia are read once, here.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const radius0 = camera.radius;
    const wheelPrecision = camera.wheelPrecision;
    const inertia = camera.inertia;

    if (!(Number.isFinite(wheelPrecision) && wheelPrecision > 0)) {
        throw new RangeError(`attachSteadyZoom: wheelPrecision must be a positive finite number, got ${wheelPrecision}`);
    }
    if (!(Number.isFinite(inertia) && inertia >= 0 && inertia < 1)) {
        throw new RangeError(`attachSteadyZoom: inertia must be in [0, 1), got ${inertia}`);
    }

    // World units of radius change per unit of deltaY, for the whole eased movement.
    const unitsPerDeltaY = radius0 / (wheelPrecision * 1000) / (1 - inertia);

    // Registered before attachControl so that, on the canvas, this capture listener runs
    // first and stopImmediatePropagation keeps the library's wheel handler from running.
    const onWheel = (event: WheelEvent): void => {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.deltaY === 0) {
            return;
        }
        // Positive deltaY zooms out, as in the library's default controls.
        camera.radius = Math.max(MIN_RADIUS, camera.radius + event.deltaY * unitsPerDeltaY);
    };
    canvas.addEventListener("wheel", onWheel, { capture: true, passive: false });

    const detachControls = attachControl(camera, canvas, scene);

    return () => {
        canvas.removeEventListener("wheel", onWheel, { capture: true });
        detachControls();
    };
}
