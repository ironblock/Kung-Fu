import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera`, and keeps the camera's radius (its distance from
 * the orbit target) within [minDistance, maxDistance] at all times.
 *
 * The radius is bounded by setCameraLimits, which clamps on every radius write
 * (wheel inertia, pinch, and any direct assignment), so the range holds however
 * hard the user zooms. A camera that starts outside the range is moved inside
 * immediately.
 *
 * Returns a function that removes the controls, stops the clamping, and restores
 * the camera's previous radius limits.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance)) {
        throw new RangeError("attachLimitedOrbit: minDistance and maxDistance must be finite numbers");
    }
    if (minDistance <= 0 || maxDistance < minDistance) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Clamps the radius now and on every later radius write.
    const stopLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    let stopControls: (() => void) | undefined;
    try {
        // Passing the scene lets the controls' inertia move the camera each frame.
        stopControls = attachControl(camera, canvas, scene);
    } catch (err) {
        stopLimits();
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
        throw err;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;

        stopControls?.();
        stopLimits();

        // setCameraLimits' disposer leaves the limit fields set; put back what was there.
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };
}
