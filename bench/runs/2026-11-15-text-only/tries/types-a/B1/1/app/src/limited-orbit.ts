import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attach the library's orbit/zoom controls to an ArcRotateCamera, with the
 * camera's radius (distance from its orbit target) kept inside
 * [minDistance, maxDistance].
 *
 * The range is enforced by setCameraLimits, which clamps the current pose right
 * away and installs a self-clamp hook on the radius setter, so wheel, pinch and
 * inertia writes cannot leave the range on any frame.
 *
 * Returns a cleanup function that detaches the canvas listeners and the
 * per-frame inertia hook, then removes the limit hook. Safe to call repeatedly.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!(minDistance >= 0) || !(maxDistance >= minDistance)) {
        throw new RangeError(`Invalid zoom range: min=${minDistance}, max=${maxDistance}`);
    }

    // Set limits first so an out-of-range starting radius is pulled in before
    // any input can be handled.
    const disposeLimits = setCameraLimits(camera, {
        lowerRadiusLimit: minDistance,
        upperRadiusLimit: maxDistance,
    });
    const detachControls = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detachControls();
        disposeLimits();
    };
}
