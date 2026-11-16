import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera`, and keeps the camera's radius (distance from
 * its target) within [minDistance, maxDistance] on every frame.
 *
 * The camera is clamped as soon as this is called, so a starting radius
 * outside the range is corrected immediately.
 *
 * Returns a function that removes the controls and the radius limits.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (
        !Number.isFinite(minDistance) ||
        !Number.isFinite(maxDistance) ||
        minDistance < 0 ||
        maxDistance < minDistance
    ) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 <= minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Limits are applied via setCameraLimits: writing the limit fields directly
    // has no effect on the camera (see camera-notes.md, note 2). The scene is
    // passed so the limits are enforced on the per-frame camera update.
    const removeLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    // The scene argument is required for the drag and wheel input to move the
    // camera at all (see camera-notes.md, note 1).
    const removeControls = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        removeControls();
        removeLimits();
    };
}
