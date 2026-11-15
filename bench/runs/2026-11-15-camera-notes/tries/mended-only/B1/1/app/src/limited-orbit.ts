import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * two-finger pinch to zoom) to `camera`, keeping `camera.radius` within
 * [minDistance, maxDistance] at all times.
 *
 * Returns a function that removes the controls and stops the range clamp.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance)) {
        throw new RangeError("attachLimitedOrbit: minDistance and maxDistance must be finite numbers");
    }
    if (minDistance <= 0 || minDistance > maxDistance) {
        throw new RangeError("attachLimitedOrbit: require 0 < minDistance <= maxDistance");
    }

    // Install the radius bounds first. Writes to radius (wheel inertia, pinch,
    // programmatic sets) are then clamped to these bounds.
    const stopClamp = camera.setCameraLimits({ radiusMin: minDistance, radiusMax: maxDistance });

    // Bring a camera that starts outside the range inside right away.
    camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));

    // Wheel zoom only takes effect when the controls are attached with a scene.
    const detachControls = camera.attachControl(canvas, { scene });

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        detachControls();
        stopClamp();
    };
}
