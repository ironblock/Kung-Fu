import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit controls (drag to orbit, wheel / pinch to
 * zoom) to `camera` on `canvas`, keeping the camera's radius (distance from its
 * target) within [minDistance, maxDistance].
 *
 * The radius bound is enforced by the library's own limit mechanism
 * (`setCameraLimits`): the camera clamps itself inside its radius setter on every
 * write, so wheel inertia and direct pinch writes can never push it out of range,
 * not even for one frame. `setCameraLimits` also clamps the current pose right
 * away, so a camera that starts outside the range is brought inside immediately.
 *
 * Returns a function that removes the canvas listeners, the per-frame inertia
 * hook, and the self-clamp hook. Safe to call more than once.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance < 0 || minDistance > maxDistance) {
        throw new RangeError(`attachLimitedOrbit: invalid distance range [${minDistance}, ${maxDistance}]`);
    }

    // Limits first, so the starting pose is clamped before any input can arrive.
    const removeLimits = setCameraLimits(camera, {
        lowerRadiusLimit: minDistance,
        upperRadiusLimit: maxDistance,
    });

    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        removeLimits();
    };
}
