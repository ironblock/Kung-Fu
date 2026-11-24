import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard arc-rotate controls (drag to orbit, wheel and
 * two-finger pinch to zoom) and keep the camera's orbit radius within
 * [minDistance, maxDistance].
 *
 * The radius bound uses the library's own `setCameraLimits`, which installs a
 * clamp hook that the camera's `radius` setter runs on every write. Wheel
 * inertia, pinch writes and any other code that changes the radius are
 * therefore snapped into range in the same statement, so the camera is never
 * out of range when a frame renders. A camera that starts out of range is
 * clamped immediately.
 *
 * The returned function removes the canvas listeners and the per-frame inertia
 * hook, and restores the camera's previous radius limits and clamp hook. It is
 * safe to call more than once.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number
): () => void {
    if (!(minDistance >= 0) || !(maxDistance >= minDistance)) {
        throw new RangeError(`attachLimitedOrbit: need 0 <= minDistance <= maxDistance (got ${minDistance}, ${maxDistance})`);
    }

    // Remember what was there before, so detaching leaves the camera as we found it
    // (including any alpha/beta limits set earlier through setCameraLimits).
    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;
    const previousHook = camera._clampToLimits;

    // Clamps the current radius right away (zeroing zoom inertia) and keeps it clamped on every change.
    const removeLimits = setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance });
    const ourHook = camera._clampToLimits;

    // Standard pointer / wheel / touch controls; the scene drives the inertia each frame.
    const detachControls = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        // Only restore if nobody replaced our limits in the meantime.
        if (camera._clampToLimits === ourHook) {
            removeLimits();
            camera._clampToLimits = previousHook;
            camera.lowerRadiusLimit = previousLower;
            camera.upperRadiusLimit = previousUpper;
        }
    };
}
