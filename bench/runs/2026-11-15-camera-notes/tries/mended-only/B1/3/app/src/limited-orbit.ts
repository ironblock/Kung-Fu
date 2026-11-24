import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Gives an arc-rotate camera the library's standard mouse/touch controls
 * (drag to orbit, wheel and pinch to zoom) while keeping its radius (distance
 * from the orbit target) within [minDistance, maxDistance].
 *
 * The radius bounds are enforced by the library's limits mechanism, which
 * clamps every write to alpha/beta/radius (including wheel, inertia and pinch),
 * so no per-frame code is needed. A camera already outside the range is
 * brought inside immediately.
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
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance <= 0 || maxDistance < minDistance) {
        throw new RangeError(`Invalid distance range: min ${minDistance}, max ${maxDistance}`);
    }

    // Limit fields only take effect once setCameraLimits has been called.
    camera.lowerRadiusLimit = minDistance;
    camera.upperRadiusLimit = maxDistance;
    const stopLimits = setCameraLimits(camera);

    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        stopLimits();
    };
}
