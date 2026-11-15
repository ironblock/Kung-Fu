import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's orbit controls (drag to rotate, wheel and pinch to zoom)
 * to an ArcRotateCamera, with the camera's radius (distance from its orbit
 * target) kept within [minDistance, maxDistance].
 *
 * The radius bounds are installed with setCameraLimits, which clamps the camera
 * immediately and then snaps every radius write (wheel, pinch, inertia) back
 * into range, so the bound holds on every frame.
 *
 * The returned function detaches the canvas listeners and removes the limit
 * hook. It is idempotent.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance)) {
        throw new RangeError(`minDistance and maxDistance must be finite numbers (got ${minDistance}, ${maxDistance})`);
    }
    if (minDistance < 0 || maxDistance < minDistance) {
        throw new RangeError(`expected 0 <= minDistance <= maxDistance (got ${minDistance}, ${maxDistance})`);
    }

    // Install the limits first so an out-of-range starting radius is pulled in
    // before any input can arrive.
    const releaseLimits = setCameraLimits(camera, {
        lowerRadiusLimit: minDistance,
        upperRadiusLimit: maxDistance,
    });

    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (err) {
        releaseLimits();
        throw err;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        releaseLimits();
    };
}
