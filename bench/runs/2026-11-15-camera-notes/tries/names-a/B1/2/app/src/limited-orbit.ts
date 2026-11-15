import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera`, with the camera's radius (distance from its
 * orbit target) kept within [minDistance, maxDistance].
 *
 * The radius limits are enforced by the library via `setCameraLimits`, which
 * is the mechanism that also covers zoom inertia. If the camera starts outside
 * the range, it is moved inside immediately.
 *
 * Returns a function that removes the controls and the limits.
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

    const removeLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    try {
        // Bring an out-of-range camera inside right away. Pending zoom inertia
        // is discarded so it cannot push the radius back out.
        if (camera.radius < minDistance || camera.radius > maxDistance) {
            camera.inertialRadiusOffset = 0;
            camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));
            camera._clampToLimits?.();
        }

        const removeControls = attachControl(camera, canvas, scene);

        let disposed = false;
        return () => {
            if (disposed) return;
            disposed = true;
            removeControls();
            removeLimits();
        };
    } catch (err) {
        removeLimits();
        throw err;
    }
}
