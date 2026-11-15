import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Gives an ArcRotateCamera the library's standard mouse/touch orbit and zoom
 * controls, with the camera distance (radius) held between `minDistance` and
 * `maxDistance`.
 *
 * The range is enforced by the library's camera setters (via setCameraLimits),
 * so every radius write, including wheel inertia and pinch, is clamped at the
 * moment it happens. The camera is never observably outside the range.
 *
 * If the camera already sits outside the range, it is moved inside right away.
 *
 * Returns a function that removes the canvas listeners, the per-frame inertia
 * hook, and the radius limits this call installed.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number
): () => void {
    if (!(Number.isFinite(minDistance) && Number.isFinite(maxDistance) && minDistance > 0 && minDistance <= maxDistance)) {
        throw new RangeError(`attachLimitedOrbit: expected 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`);
    }

    // Install the limits first so the camera is brought into range before the
    // controls can move it.
    const detachLimits = setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance });

    // The scene is required: zoom inertia (wheel) is applied from scene._beforeRender.
    const detachControls = attachControl(camera, canvas, scene);

    return () => {
        detachControls();
        detachLimits();
        // The limit values are ours, so clear them as well. Other radius-based code
        // should not keep inheriting this range after the controls are gone.
        camera.lowerRadiusLimit = undefined;
        camera.upperRadiusLimit = undefined;
    };
}
