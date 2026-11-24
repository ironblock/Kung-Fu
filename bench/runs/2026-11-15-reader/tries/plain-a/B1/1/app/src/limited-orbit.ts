import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attach the library's orbit controls (drag to orbit, wheel and pinch to zoom)
 * to `camera`, keeping its distance from the orbit target within
 * `[minDistance, maxDistance]`.
 *
 * The limit is enforced by the camera's radius setter (via `setCameraLimits`),
 * so every write (wheel inertia, pinch, direct assignment) is clamped at the
 * moment it happens and the camera is never observed outside the range.
 * A camera that starts outside the range is moved inside it immediately.
 *
 * @returns A function that removes the canvas listeners, the per-frame inertia
 * hook and the distance limits. Safe to call more than once.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number
): () => void {
    if (!(Number.isFinite(minDistance) && Number.isFinite(maxDistance) && minDistance > 0 && minDistance <= maxDistance)) {
        throw new RangeError(`attachLimitedOrbit: expected 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`);
    }

    // Remember any radius limits the caller had set so dispose can restore them.
    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Installs the self-clamp hook on the radius setter and clamps the current radius now.
    const releaseLimits = setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance });
    const detachControls = attachControl(camera, canvas, scene);

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
