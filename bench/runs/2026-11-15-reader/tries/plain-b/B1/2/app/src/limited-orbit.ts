import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's orbit/zoom mouse and touch controls to `camera`, with the
 * camera's distance from its orbit target kept within [minDistance, maxDistance].
 *
 * The range is enforced by the library's radius setter hook (`setCameraLimits`),
 * so every radius write (wheel inertia, pinch, programmatic) is clamped in the same
 * statement that produces it. A camera that starts outside the range is moved
 * inside it immediately.
 *
 * The returned function detaches the canvas listeners and the per-frame inertia
 * hook, and clears the radius limits this call set. It is safe to call more than once.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance <= 0 || minDistance > maxDistance) {
        throw new RangeError(`attachLimitedOrbit: expected finite 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`);
    }

    setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance }, scene);
    const detachControls = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        // Calling setCameraLimits with both radius bounds cleared removes the clamp hook it
        // installed earlier and returns its disposer, which we call right away.
        setCameraLimits(camera, { lowerRadiusLimit: undefined, upperRadiusLimit: undefined })();
    };
}
