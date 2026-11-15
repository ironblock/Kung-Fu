import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Gives `camera` the library's default arc-rotate mouse and touch controls on
 * `canvas` (drag to orbit, right-drag to pan, wheel and pinch to zoom), except
 * that every wheel notch moves the camera the same distance along its radius,
 * at any radius.
 *
 * The library turns each wheel event into `deltaY * radius / (wheelPrecision * 1000)`
 * of `inertialRadiusOffset`, which the scene's frames then glide out, so its
 * steps shrink near the target and grow far from it. Here the library still
 * handles every wheel event, and straight after it we rescale what it added
 * from the radius and wheelPrecision at that moment to the ones the camera has
 * now. Each notch then glides exactly as a default notch would on the camera as
 * it is when this is called.
 *
 * Returns a function that removes the controls.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // What the library multiplies deltaY / 1000 by, for the camera as it is now.
    const steadyScale = camera.radius / camera.wheelPrecision;

    let pending: { event: WheelEvent; offset: number; scale: number } | null = null;

    // Runs before the library's wheel listener: it is a capture listener on the
    // canvas itself, added before attachControl adds its own.
    const beforeLibrary = (event: WheelEvent): void => {
        pending = { event, offset: camera.inertialRadiusOffset, scale: camera.radius / camera.wheelPrecision };
    };

    // Runs after the library's wheel listener: a bubbling listener added after attachControl.
    const afterLibrary = (event: WheelEvent): void => {
        const before = pending;
        pending = null;
        if (before === null || before.event !== event) return;

        if (before.scale !== 0 && Number.isFinite(before.scale)) {
            const added = camera.inertialRadiusOffset - before.offset;
            if (added !== 0) {
                camera.inertialRadiusOffset = before.offset + added * (steadyScale / before.scale);
            }
        } else {
            // A radius or wheelPrecision of 0 leaves the library nothing to rescale; apply its rule with our scale.
            camera.inertialRadiusOffset = before.offset - (event.deltaY * steadyScale) / 1000;
        }
    };

    canvas.addEventListener("wheel", beforeLibrary, { capture: true, passive: true });
    let detachLibrary: () => void;
    try {
        // A scene is required: without one the library's drag and wheel never move the camera.
        detachLibrary = attachControl(camera, canvas, scene);
    } catch (error) {
        canvas.removeEventListener("wheel", beforeLibrary, { capture: true });
        throw error;
    }
    canvas.addEventListener("wheel", afterLibrary, { passive: true });

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        canvas.removeEventListener("wheel", beforeLibrary, { capture: true });
        canvas.removeEventListener("wheel", afterLibrary);
        pending = null;
        // Removes the library's canvas listeners and its per-frame callback.
        detachLibrary();
    };
}
