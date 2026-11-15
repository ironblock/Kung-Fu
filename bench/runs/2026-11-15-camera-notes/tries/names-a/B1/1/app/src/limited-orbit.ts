import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse/touch controls to `camera`
 * and keeps the camera's radius (distance from its orbit target) within
 * [minDistance, maxDistance].
 *
 * Returns a function that removes the controls and the radius limits.
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
        throw new RangeError(`Invalid distance range: [${minDistance}, ${maxDistance}]`);
    }

    // Enforce the radius range through the library's own limit mechanism.
    const removeLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    let removeControls: () => void;
    try {
        removeControls = attachControl(camera, canvas, scene);
    } catch (err) {
        removeLimits();
        throw err;
    }

    // A camera that starts outside the range is brought inside right away.
    camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        removeControls();
        removeLimits();
    };
}
