import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera`, keeping `camera.radius` within
 * [minDistance, maxDistance] at all times.
 *
 * Returns a function that removes the controls and restores the camera's
 * previous radius limit fields.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance)) {
        throw new RangeError("minDistance and maxDistance must be finite numbers");
    }
    if (minDistance < 0 || minDistance > maxDistance) {
        throw new RangeError("Expected 0 <= minDistance <= maxDistance");
    }

    const savedLower = camera.lowerRadiusLimit;
    const savedUpper = camera.upperRadiusLimit;

    // setCameraLimits is what makes every radius write (wheel, pinch, drag
    // inertia) clamp to the range. Hand-written limit fields alone do not.
    const disposeLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    let disposeControls: (() => void) | undefined;
    let disposed = false;

    const restoreLimitFields = () => {
        if (savedLower === undefined) {
            delete camera.lowerRadiusLimit;
        } else {
            camera.lowerRadiusLimit = savedLower;
        }
        if (savedUpper === undefined) {
            delete camera.upperRadiusLimit;
        } else {
            camera.upperRadiusLimit = savedUpper;
        }
    };

    try {
        // Bring a camera that starts outside the range inside right away.
        const r = camera.radius;
        const clamped = Math.min(maxDistance, Math.max(minDistance, r));
        if (clamped !== r) {
            camera.radius = clamped;
        }

        disposeControls = attachControl(camera, canvas, scene);
    } catch (err) {
        disposeLimits();
        restoreLimitFields();
        throw err;
    }

    return () => {
        if (disposed) return;
        disposed = true;
        disposeControls?.();
        disposeLimits();
        restoreLimitFields();
    };
}
