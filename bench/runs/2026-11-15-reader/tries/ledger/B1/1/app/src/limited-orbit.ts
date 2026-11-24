import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's orbit (drag), wheel and two-finger pinch controls to an
 * ArcRotateCamera, keeping the camera's distance from its target (its radius)
 * within [minDistance, maxDistance].
 *
 * The range is enforced by `setCameraLimits`: every write to `camera.radius`
 * (wheel inertia, pinch, interpolation, direct writes) is clamped in the setter
 * itself, so the radius is in range at every point a per-frame callback can read
 * it. If the camera starts outside the range it is clamped as soon as this
 * function is called.
 *
 * `scene` is required for zoom and orbit: the library applies wheel and drag
 * motion from the scene's per-frame hook.
 *
 * The returned function removes the canvas listeners and the per-frame hook,
 * removes the radius clamp, and restores the camera's radius limits to the
 * values they had before this call. It is idempotent. Calling it from inside a
 * frame callback can cause the next callback that frame to be skipped (the
 * library splices its hook out of the scene's list).
 *
 * @throws RangeError if minDistance is not a finite number >= 0, or maxDistance
 * is NaN or less than minDistance.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number
): () => void {
    if (!(Number.isFinite(minDistance) && minDistance >= 0)) {
        throw new RangeError(`minDistance must be a finite number >= 0, got ${minDistance}`);
    }
    if (!(maxDistance >= minDistance)) {
        throw new RangeError(`maxDistance must be >= minDistance (${minDistance}), got ${maxDistance}`);
    }

    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Clamps the current radius into range right away and on every later radius write.
    const releaseLimits = setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance }, scene);
    const detachControls = attachControl(camera, canvas, scene);

    let attached = true;
    return () => {
        if (!attached) {
            return;
        }
        attached = false;
        detachControls();
        releaseLimits();
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };
}
