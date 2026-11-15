import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls to `canvas` (drag to orbit,
 * mouse wheel and two-finger pinch to zoom) and keeps the camera's distance
 * from its target within [minDistance, maxDistance].
 *
 * The range is enforced by the library's `setCameraLimits`. It clamps the
 * current radius right away, then clamps again inside the camera's radius
 * setter on every write. Wheel inertia and direct pinch writes therefore can
 * never leave the camera outside the range, not even for one frame.
 *
 * Returns a function that removes the controls (canvas listeners and the
 * per-frame inertia hook), removes the clamp, and puts back the radius limits
 * the camera had before. It is safe to call more than once.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    // Written as negated >= so that NaN fails too.
    if (!(minDistance >= 0) || !(maxDistance >= minDistance)) {
        throw new RangeError(
            `attachLimitedOrbit: expected 0 <= minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Brings an out-of-range camera inside now, and keeps it inside on every
    // later radius write.
    const removeLimits = setCameraLimits(camera, {
        lowerRadiusLimit: minDistance,
        upperRadiusLimit: maxDistance,
    });

    const restoreLimits = (): void => {
        removeLimits();
        // The docs only say the disposer removes the clamp hook. Put the old
        // values back ourselves, so a later setCameraLimits call elsewhere
        // (limits compose) doesn't quietly bring our range back.
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };

    let detachControls: () => void;
    try {
        // The scene is required: wheel zoom works through inertia, and inertia
        // only runs in the scene's per-frame hook.
        detachControls = attachControl(camera, canvas, scene);
    } catch (error) {
        restoreLimits();
        throw error;
    }

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detachControls();
        restoreLimits();
    };
}
