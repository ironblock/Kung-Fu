import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate pointer controls (drag to orbit,
 * wheel / pinch to zoom) to `canvas`, while keeping the camera's radius within
 * [minDistance, maxDistance] on every frame.
 *
 * Returns a function that detaches the controls and removes the per-frame
 * limit enforcement.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (Number.isNaN(minDistance) || Number.isNaN(maxDistance)) {
        throw new RangeError("attachLimitedOrbit: minDistance and maxDistance must be numbers");
    }
    if (minDistance > maxDistance) {
        throw new RangeError(
            `attachLimitedOrbit: minDistance (${minDistance}) must not exceed maxDistance (${maxDistance})`,
        );
    }

    // Register the radius limits with the scene so they are enforced every frame,
    // including against zoom inertia from wheel and pinch input.
    const removeLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    // Bring the camera inside the range right away rather than waiting for the
    // next frame, and drop any pending zoom momentum that would push it back out.
    if (camera.radius < minDistance || camera.radius > maxDistance) {
        camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));
        camera.inertialRadiusOffset = 0;
    }

    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        removeLimits();
    };
}
