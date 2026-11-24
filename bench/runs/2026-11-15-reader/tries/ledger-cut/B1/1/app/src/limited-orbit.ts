import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's orbit controls (drag to orbit, wheel and pinch to zoom)
 * to an ArcRotateCamera, with the camera's distance from its target kept
 * between `minDistance` and `maxDistance`.
 *
 * The range is enforced by the library's own radius limits (setCameraLimits),
 * which clamp inside the radius setter. Every write to the radius, whether from
 * the wheel inertia, the pinch, or anything else, is therefore clamped before
 * it is observable. A camera that starts outside the range is moved inside it
 * as soon as this function is called.
 *
 * The scene is required: wheel zoom is applied per frame through the scene's
 * render loop, so without it the wheel would do nothing.
 *
 * @returns A function that removes the canvas listeners, the per-frame inertia
 * hook and the radius limits this call set. Safe to call more than once.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number
): () => void {
    if (!(minDistance > 0) || !(maxDistance >= minDistance) || !Number.isFinite(maxDistance)) {
        throw new RangeError(`attachLimitedOrbit: need 0 < minDistance <= maxDistance < Infinity, got ${minDistance} and ${maxDistance}`);
    }

    // Remember any radius limits already on the camera so disposing restores them.
    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    const releaseLimits = setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance }, scene);
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
