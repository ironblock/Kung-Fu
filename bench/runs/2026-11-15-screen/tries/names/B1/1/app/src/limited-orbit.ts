import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera`, with the camera's radius (distance from its
 * target) kept within [minDistance, maxDistance].
 *
 * If the camera's radius is outside that range when this is called, it is
 * moved inside the range immediately.
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
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance <= 0 || minDistance > maxDistance) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 < minDistance <= maxDistance (got ${minDistance}, ${maxDistance})`,
        );
    }

    // Bring the camera inside the range right away.
    camera.radius = Math.min(Math.max(camera.radius, minDistance), maxDistance);

    // Enforce the radius range through the library's own limits mechanism.
    const disposeLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

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
