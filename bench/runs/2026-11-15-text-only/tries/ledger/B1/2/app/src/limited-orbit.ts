import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Gives an ArcRotate camera the library's mouse and touch controls (drag to orbit,
 * wheel and pinch to zoom) while keeping its radius between minDistance and maxDistance.
 *
 * Returns a function that removes the DOM listeners and the per-frame hooks it installed.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!(minDistance > 0) || !Number.isFinite(maxDistance) || !(maxDistance >= minDistance)) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Install the clamp hook before writing the limit fields. Direct writes to the
    // limit fields clamp nothing until setCameraLimits has run on this camera.
    const releaseLimits = setCameraLimits(camera);
    camera.lowerRadiusLimit = minDistance;
    camera.upperRadiusLimit = maxDistance;

    // A camera that starts outside the range is brought inside now, not on the first frame.
    camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));

    // The scene argument is required: without it the controls accumulate input but nothing applies it.
    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        releaseLimits();
    };
}
