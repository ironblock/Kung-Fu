import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to an ArcRotateCamera, with the camera radius (distance from
 * the orbit target) kept within [minDistance, maxDistance].
 *
 * The radius bounds are enforced by the camera's own setters (via
 * setCameraLimits), so the limit holds on every frame regardless of input
 * source. A camera that starts outside the range is moved inside it
 * immediately.
 *
 * @returns A cleanup function that removes the canvas listeners, the
 * per-frame inertia hook, and the radius clamp. Safe to call more than once.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (
        !Number.isFinite(minDistance) ||
        !Number.isFinite(maxDistance) ||
        minDistance < 0 ||
        minDistance > maxDistance
    ) {
        throw new RangeError(
            `attachLimitedOrbit: expected 0 <= minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Clamp first so the current pose is inside the range before any input arrives.
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

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        releaseLimits();
    };
}
