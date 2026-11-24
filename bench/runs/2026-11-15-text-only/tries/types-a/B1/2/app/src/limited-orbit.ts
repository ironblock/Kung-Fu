import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit/pan/zoom controls to an ArcRotateCamera,
 * with the camera's radius (distance from its orbit target) kept inside
 * [minDistance, maxDistance].
 *
 * - setCameraLimits clamps the current radius immediately and installs a
 *   self-clamp hook, so wheel and pinch zoom can never leave the range on any frame.
 * - attachControl installs the mouse/touch handlers and the per-frame inertia hook.
 *
 * The returned function detaches the controls and removes the limit hook.
 * It is safe to call more than once.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance <= 0 || maxDistance < minDistance) {
        throw new RangeError(
            `attachLimitedOrbit: expected finite distances with 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Limits first, so the camera is inside the range before the controls can move it.
    const releaseLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (error) {
        releaseLimits();
        throw error;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        releaseLimits();
    };
}
