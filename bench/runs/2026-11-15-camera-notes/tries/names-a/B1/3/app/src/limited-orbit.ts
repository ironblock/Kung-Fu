import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera`, with the camera's radius (distance from its
 * target) kept within [minDistance, maxDistance].
 *
 * The range is enforced by the library's own radius limits, so it applies to
 * every input path (wheel, pinch, inertia) without any per-frame code of ours.
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

    const detachControls = attachControl(camera, canvas, scene);
    const detachLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    // Bring the camera inside the range right away, and drop any residual
    // zoom inertia that could push it back out.
    const clampedRadius = Math.min(Math.max(camera.radius, minDistance), maxDistance);
    if (camera.radius !== clampedRadius) {
        camera.radius = clampedRadius;
    }
    camera.inertialRadiusOffset = 0;

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachLimits();
        detachControls();
    };
}
