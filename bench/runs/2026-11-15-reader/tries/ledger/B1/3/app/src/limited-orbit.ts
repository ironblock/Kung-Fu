import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit (drag), wheel and pinch controls to an
 * ArcRotateCamera, with the camera's distance from its target held between
 * `minDistance` and `maxDistance`.
 *
 * The range is enforced by `setCameraLimits`, which the camera's radius setter
 * calls on every write. Wheel inertia and pinch writes both go through that
 * setter, so the radius is clamped in the same statement that moves it and is
 * never outside the range at any point a per-frame callback could read it. No
 * per-frame hook of ours is installed.
 *
 * If the camera already lies outside the range, it is moved inside immediately.
 *
 * Returns a cleanup function that removes the canvas listeners, the scene
 * per-frame hook and the zoom limit, and restores the radius limits the camera
 * had before. Calling it more than once is harmless.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number
): () => void {
    if (!(minDistance > 0) || !(maxDistance >= minDistance)) {
        throw new RangeError(`attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`);
    }

    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Installs the radius bounds and clamps the current radius into them right away.
    const disposeLimits = setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance }, scene);
    // The scene is required so that the controls apply wheel and drag inertia each frame.
    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        detachControls();
        disposeLimits();
        // Plain fields, so this does not reach the clamp hook; the hook was removed just above.
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };
}
