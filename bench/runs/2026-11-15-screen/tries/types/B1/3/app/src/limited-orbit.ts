import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's orbit/pan/zoom controls to an ArcRotateCamera, with the
 * camera's distance from its orbit target clamped to [minDistance, maxDistance].
 *
 * - The radius range is enforced by the camera's own setters (via
 *   `setCameraLimits`), so wheel, pinch and inertia can never leave it, on any frame.
 * - If the camera currently sits outside the range, it is moved inside immediately.
 * - Nothing of ours runs per frame; the library's inertia hook is the only per-frame work.
 *
 * Returns a cleanup function that removes the canvas listeners and the radius
 * limits, restoring the camera's previous radius limits. It is safe to call more than once.
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
        minDistance <= 0 ||
        minDistance > maxDistance
    ) {
        throw new RangeError(
            `attachLimitedOrbit: expected 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Remember any radius limits already on the camera so cleanup can restore them.
    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Set limits first so the initial pose is clamped before any input is processed.
    const removeLimits = setCameraLimits(camera, {
        lowerRadiusLimit: minDistance,
        upperRadiusLimit: maxDistance,
    });

    const detachControls = attachControl(camera, canvas, scene);

    let attached = true;
    return () => {
        if (!attached) return;
        attached = false;
        detachControls();
        removeLimits();
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };
}
