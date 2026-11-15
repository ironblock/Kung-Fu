import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** The library's orbit controls never write a radius below this value (they floor it at 0.01). */
const MIN_SUPPORTED_DISTANCE = 0.01;

/**
 * Attaches the library's standard orbit (drag), wheel and pinch controls to `camera`, with the
 * orbit distance (radius) limited to [minDistance, maxDistance].
 *
 * The limit is enforced by the camera's radius setter, so the distance is never outside the range
 * at any point a per-frame reader can observe it. If the camera already lies outside the range it is
 * moved inside immediately.
 *
 * Returns a function that removes the canvas listeners, the per-frame inertia hook and the limits
 * installed by this call. Calling it more than once is safe.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance)) {
        throw new RangeError("attachLimitedOrbit: minDistance and maxDistance must be finite numbers");
    }
    if (minDistance < MIN_SUPPORTED_DISTANCE) {
        throw new RangeError(`attachLimitedOrbit: minDistance must be at least ${MIN_SUPPORTED_DISTANCE}`);
    }
    if (maxDistance < minDistance) {
        throw new RangeError("attachLimitedOrbit: maxDistance must be greater than or equal to minDistance");
    }

    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Installs the radius clamp and clamps the current radius into range right away.
    const releaseLimits = setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance });
    // Registers the per-frame inertia hook on the scene and the canvas input listeners.
    const detachControls = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        releaseLimits();
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };
}
