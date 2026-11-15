import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** The real camera values hidden while the library's wheel handler runs. */
interface HiddenState {
    radius: number;
    wheelPrecision: number;
    lowerRadiusLimit: number | undefined;
    upperRadiusLimit: number | undefined;
    clampToLimits: (() => void) | undefined;
    /** `camera.radius` read back right after it was set to the call-time radius. */
    shownRadius: number;
}

/**
 * Gives `camera` the library's usual controls on `canvas` (drag to orbit, right-drag to pan,
 * wheel and pinch to zoom), except that every wheel notch moves the camera by the same
 * distance toward or away from its target, wherever the camera is. That distance is the one a
 * notch gives with the default controls on the camera as it is now.
 *
 * The step is not recomputed here. The library's own wheel handler still handles every wheel
 * event, so deltaY/deltaMode handling, inertia and limits stay the library's. While the handler
 * runs, it is shown the radius and wheelPrecision the camera had when this was called, with the
 * radius limits lifted (otherwise a camera that started at a limit would make every later notch
 * in that direction zero). So it computes the step it would have computed then. The real values
 * are put back as soon as the handler returns:
 *
 *   - a capture listener registered before `attachControl` shows the call-time values, which puts
 *     it ahead of the library's wheel listener whichever phase the library uses;
 *   - a bubble listener registered after `attachControl` puts the real values back.
 *
 * A step the handler adds to `camera.inertialRadiusOffset` stays there, and the library's
 * inertia spends it on the real camera as usual. A step it makes to `camera.radius` directly is
 * carried over to the real radius and clamped to the real limits.
 *
 * Returns a function that removes the controls and every listener this added.
 */
export function attachSteadyZoom(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const callTimeRadius = camera.radius;
    const callTimeWheelPrecision = camera.wheelPrecision;

    let hidden: HiddenState | null = null;

    const putBackRealCamera = (): void => {
        const real = hidden;
        if (!real) return;
        hidden = null;

        const directStep = camera.radius - real.shownRadius;

        camera.wheelPrecision = real.wheelPrecision;
        camera.lowerRadiusLimit = real.lowerRadiusLimit;
        camera.upperRadiusLimit = real.upperRadiusLimit;
        camera._clampToLimits = real.clampToLimits;

        if (directStep === 0 || !Number.isFinite(directStep)) {
            camera.radius = real.radius;
            return;
        }
        let radius = real.radius + directStep;
        if (typeof real.lowerRadiusLimit === "number") radius = Math.max(radius, real.lowerRadiusLimit);
        if (typeof real.upperRadiusLimit === "number") radius = Math.min(radius, real.upperRadiusLimit);
        camera.radius = radius;
        camera._clampToLimits?.();
    };

    const showCallTimeCamera = (): void => {
        // If the previous event's put-back never ran, do it now rather than stack two swaps.
        putBackRealCamera();
        hidden = {
            radius: camera.radius,
            wheelPrecision: camera.wheelPrecision,
            lowerRadiusLimit: camera.lowerRadiusLimit,
            upperRadiusLimit: camera.upperRadiusLimit,
            clampToLimits: camera._clampToLimits,
            shownRadius: NaN,
        };
        camera._clampToLimits = undefined;
        camera.lowerRadiusLimit = undefined;
        camera.upperRadiusLimit = undefined;
        camera.wheelPrecision = callTimeWheelPrecision;
        camera.radius = callTimeRadius;
        hidden.shownRadius = camera.radius;
    };

    const beforeLibrary: AddEventListenerOptions = { capture: true, passive: true };
    const afterLibrary: AddEventListenerOptions = { passive: true };

    canvas.addEventListener("wheel", showCallTimeCamera, beforeLibrary);
    let detachDefaultControls: () => void;
    try {
        detachDefaultControls = attachControl(camera, canvas, scene, {
            pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
        });
    } catch (error) {
        canvas.removeEventListener("wheel", showCallTimeCamera, beforeLibrary);
        throw error;
    }
    canvas.addEventListener("wheel", putBackRealCamera, afterLibrary);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        canvas.removeEventListener("wheel", showCallTimeCamera, beforeLibrary);
        canvas.removeEventListener("wheel", putBackRealCamera, afterLibrary);
        putBackRealCamera();
        detachDefaultControls();
    };
}
