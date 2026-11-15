import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit controls (drag to orbit, wheel and
 * two-finger pinch to zoom) to `camera`, keeping its distance from the orbit
 * target within `[minDistance, maxDistance]`.
 *
 * The range is enforced by the library's own orbit limits (`setCameraLimits`),
 * which clamp inside the camera's radius setter. That covers direct writes
 * (pinch), inertial zoom (wheel), and any other code that sets `radius`, so the
 * camera is never observably out of range, not even for a frame.
 *
 * If the camera already sits outside the range, it is moved inside immediately.
 *
 * Returns a cleanup function that removes the canvas listeners, the per-frame
 * inertia hook, and the range enforcement. Calling it more than once is safe.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number
): () => void {
    if (!(Number.isFinite(minDistance) && Number.isFinite(maxDistance) && minDistance > 0 && minDistance <= maxDistance)) {
        throw new RangeError(`attachLimitedOrbit: expected finite distances with 0 < minDistance <= maxDistance, got [${minDistance}, ${maxDistance}]`);
    }

    // Clamps the current radius into range right away, then keeps it there.
    const disposeLimits = setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance }, scene);
    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        // Detach input first so nothing can change the radius while the limits come off.
        detachControls();
        disposeLimits();
    };
}
