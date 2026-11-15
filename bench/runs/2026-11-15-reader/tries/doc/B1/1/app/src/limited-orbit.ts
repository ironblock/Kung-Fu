import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's orbit/zoom/pan controls to `camera`, with the camera's
 * distance from its target clamped to [minDistance, maxDistance].
 *
 * The clamp is the library's own radius limit (`setCameraLimits`). The camera's
 * radius setter enforces it on every write, so wheel zoom, pinch zoom and
 * inertia can never leave the range, and no per-frame hook of ours is needed.
 * A camera that starts outside the range is clamped as soon as this is called.
 *
 * The returned function detaches the canvas listeners, removes the per-frame
 * inertia hook, and removes the radius limit it installed (restoring any limit
 * that was set on the camera before).
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number
): () => void {
    if (!(Number.isFinite(minDistance) && Number.isFinite(maxDistance))) {
        throw new RangeError(`attachLimitedOrbit: distance limits must be finite (got ${minDistance}, ${maxDistance})`);
    }
    if (!(minDistance > 0 && minDistance <= maxDistance)) {
        throw new RangeError(`attachLimitedOrbit: require 0 < minDistance <= maxDistance (got ${minDistance}, ${maxDistance})`);
    }

    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Installs the radius clamp and immediately clamps the current radius into range.
    const disposeLimits = setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance });
    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        detachControls();
        disposeLimits();
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };
}
