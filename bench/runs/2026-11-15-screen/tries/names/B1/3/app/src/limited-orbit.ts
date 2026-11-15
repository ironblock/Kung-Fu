import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera`, keeping `camera.radius` within
 * [minDistance, maxDistance].
 *
 * The range is enforced by the library's own radius limits
 * (`setCameraLimits`), so this function does not run any per-frame code of
 * its own. If the camera starts outside the range, it is moved inside
 * immediately.
 *
 * @returns A function that removes the controls and restores the camera's
 * previous limits.
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

    let removeLimits: () => void;
    try {
        removeLimits = setCameraLimits(
            camera,
            { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
            scene,
        );
    } catch (error) {
        detachControls();
        throw error;
    }

    // Bring a starting radius that is out of range back inside immediately.
    const clampedRadius = Math.min(maxDistance, Math.max(minDistance, camera.radius));
    if (clampedRadius !== camera.radius) {
        camera.radius = clampedRadius;
        // Drop any queued zoom motion that would carry the camera back out of range.
        camera.inertialRadiusOffset = 0;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        removeLimits();
    };
}
