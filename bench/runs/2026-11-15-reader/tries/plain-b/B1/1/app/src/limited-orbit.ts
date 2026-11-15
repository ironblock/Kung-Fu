import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit controls (drag to orbit, wheel and
 * two-finger pinch to zoom) to `camera`, keeping the camera's distance from its
 * target within `[minDistance, maxDistance]` at all times.
 *
 * The range is enforced by the library's own radius clamp (`setCameraLimits`),
 * which runs inside the radius setter. Wheel inertia and pinch writes both go
 * through that setter, so the radius is never observably outside the range,
 * not even for a single frame. A camera that starts outside the range is moved
 * inside it immediately.
 *
 * The returned function removes the canvas listeners, the per-frame inertia
 * hook and the radius clamp, and restores the camera's previous radius limits.
 * It is safe to call more than once.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance <= 0 || maxDistance < minDistance) {
        throw new RangeError(`attachLimitedOrbit: expected 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`);
    }

    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    const detachControls = attachControl(camera, canvas, scene);
    const releaseLimits = setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance }, scene);

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        detachControls();
        releaseLimits();
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };
}
