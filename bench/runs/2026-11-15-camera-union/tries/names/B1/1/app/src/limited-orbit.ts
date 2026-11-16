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
    if (!(minDistance > 0) || !(maxDistance >= minDistance)) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 < minDistance <= maxDistance (got ${minDistance}, ${maxDistance})`,
        );
    }

    // Radius limits go through the library's own limit mechanism.
    camera.lowerRadiusLimit = minDistance;
    camera.upperRadiusLimit = maxDistance;
    const disposeLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    // Bring the camera inside the range now, and drop any pending zoom
    // momentum that could push it back out.
    camera.inertialRadiusOffset = 0;
    camera.radius = Math.min(Math.max(camera.radius, minDistance), maxDistance);

    let disposeControls: () => void;
    try {
        disposeControls = attachControl(camera, canvas, scene);
    } catch (err) {
        disposeLimits();
        throw err;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        disposeControls();
        disposeLimits();
    };
}
