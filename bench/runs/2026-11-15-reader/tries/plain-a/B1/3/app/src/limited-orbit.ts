import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's orbit controls (drag to orbit, wheel and pinch to zoom)
 * to `camera`, and keeps the camera's distance from its target within
 * [`minDistance`, `maxDistance`].
 *
 * The range is enforced by the camera itself: `setCameraLimits` installs a clamp
 * that runs inside the radius setter, so wheel input, pinch input and inertia can
 * never leave a value outside the range, even within a single frame. A camera that
 * starts outside the range is moved inside it before this function returns.
 *
 * @returns A function that removes the canvas listeners, the per-frame inertia
 * hook, and the radius limits. Safe to call more than once.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance <= 0 || minDistance > maxDistance) {
        throw new RangeError(`attachLimitedOrbit: expected 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`);
    }

    // Set the limits first so the camera is clamped into range before any input can arrive.
    const removeLimits = setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance }, scene);
    const detachControls = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        removeLimits();
    };
}
