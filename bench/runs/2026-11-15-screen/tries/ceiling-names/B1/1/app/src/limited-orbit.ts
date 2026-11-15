import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Gives `camera` the library's standard arc-rotate controls on `canvas` (drag to orbit,
 * mouse wheel / two-finger pinch to zoom), while keeping the camera's distance from its
 * target (its orbit radius) within [minDistance, maxDistance] on every frame.
 *
 * Returns a function that removes the controls and the per-frame limit enforcement, and
 * puts the camera's radius limits back to what they were before.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (Number.isNaN(minDistance) || Number.isNaN(maxDistance) || minDistance < 0 || minDistance > maxDistance) {
        throw new RangeError(`attachLimitedOrbit: invalid distance range [${minDistance}, ${maxDistance}]`);
    }

    const previousLowerRadiusLimit = camera.lowerRadiusLimit;
    const previousUpperRadiusLimit = camera.upperRadiusLimit;

    // Bring the camera into range immediately instead of waiting for the next frame.
    camera.radius = Math.min(Math.max(camera.radius, minDistance), maxDistance);

    const detachControls = attachControl(camera, canvas, scene);

    let removeLimits: () => void;
    try {
        // Set up after the controls, so that if both hook the scene's frame loop, the
        // clamp runs after the controls have applied this frame's zoom (incl. inertia).
        removeLimits = setCameraLimits(
            camera,
            { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
            scene,
        );
    } catch (error) {
        detachControls();
        throw error;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        removeLimits();
        detachControls();
        camera.lowerRadiusLimit = previousLowerRadiusLimit;
        camera.upperRadiusLimit = previousUpperRadiusLimit;
    };
}
