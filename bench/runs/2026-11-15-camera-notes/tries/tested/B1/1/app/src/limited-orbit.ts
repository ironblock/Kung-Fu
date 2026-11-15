import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera`, and keeps the camera's radius (its distance from
 * the orbit target) within [minDistance, maxDistance] on every frame.
 *
 * If the camera starts outside that range it is moved inside immediately.
 * The returned function removes the controls and the radius limits.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (
        !Number.isFinite(minDistance) ||
        !Number.isFinite(maxDistance) ||
        minDistance <= 0 ||
        maxDistance < minDistance
    ) {
        throw new RangeError(
            `attachLimitedOrbit: expected 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Remember any radius limits the caller set, so disposing restores them.
    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Controls need the scene to apply their per-frame motion.
    const detachControls = attachControl(camera, canvas, scene);

    // Limit fields only take effect through setCameraLimits; once it has run,
    // every write to radius is clamped, including wheel and pinch zoom.
    const releaseLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    // Writes made before the limits were active were not clamped, so bring
    // a starting radius that is out of range inside now.
    if (camera.radius < minDistance || camera.radius > maxDistance) {
        camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        // Stops the clamping; the limit fields are left set by the library,
        // so restore what they were before this call.
        releaseLimits();
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };
}
