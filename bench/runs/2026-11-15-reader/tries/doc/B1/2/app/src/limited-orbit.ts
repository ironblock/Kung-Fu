import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's orbit controls (drag to orbit, wheel and two-finger pinch
 * to zoom) to `camera`, and keep the camera's distance from its orbit target
 * within [minDistance, maxDistance].
 *
 * The range is enforced by the library's own radius limits (`setCameraLimits`),
 * which clamp `camera.radius` inside the radius setter. Every zoom path (wheel
 * inertia, pinch writes, inertial overshoot) therefore goes through the clamp, so
 * the camera is never outside the range, not even for a frame. A camera that
 * starts outside the range is moved inside it before this function returns.
 *
 * Returns a cleanup function that removes the canvas listeners, the per-frame
 * inertia hook, and the zoom range, restoring any radius limits and clamp hook
 * the camera had before. Calling it more than once is safe.
 */
export function attachLimitedOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext, minDistance: number, maxDistance: number): () => void {
    if (!Number.isFinite(minDistance) || minDistance <= 0 || !(maxDistance >= minDistance)) {
        throw new RangeError(`attachLimitedOrbit: expected 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`);
    }

    // Remember whatever zoom limits and clamp hook were already on the camera so
    // cleanup can put them back.
    const previousLowerRadius = camera.lowerRadiusLimit;
    const previousUpperRadius = camera.upperRadiusLimit;
    const previousClampHook = camera._clampToLimits;

    const detachControls = attachControl(camera, canvas, scene);
    const disposeLimits = setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance });

    let attached = true;
    return () => {
        if (!attached) {
            return;
        }
        attached = false;
        detachControls();
        disposeLimits();
        camera.lowerRadiusLimit = previousLowerRadius;
        camera.upperRadiusLimit = previousUpperRadius;
        camera._clampToLimits = previousClampHook;
    };
}
