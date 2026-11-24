import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's orbit controls (drag to orbit, wheel and two-finger pinch to zoom)
 * to an ArcRotateCamera, with the camera's distance from its target kept in
 * [minDistance, maxDistance].
 *
 * The range is enforced by the library's own limit hook (setCameraLimits), which runs inside
 * the camera's radius setter, so every write (wheel inertia, pinch, or a direct assignment)
 * is clamped at once. A camera that starts outside the range is clamped as soon as this is
 * called.
 *
 * The returned function removes the canvas listeners and the per-frame inertia hook, uninstalls
 * the limit hook, and restores the camera's radius limits to the values they had before this call.
 * It is safe to call more than once.
 */
export function attachLimitedOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext, minDistance: number, maxDistance: number): () => void {
    if (!(Number.isFinite(minDistance) && Number.isFinite(maxDistance) && minDistance > 0 && minDistance <= maxDistance)) {
        throw new RangeError(`attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`);
    }

    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    const disposeLimits = setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance }, scene);
    const detachControls = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        disposeLimits();
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };
}
