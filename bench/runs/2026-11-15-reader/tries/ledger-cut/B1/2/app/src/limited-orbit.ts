import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit controls (drag to orbit, wheel and pinch to zoom) to an
 * ArcRotateCamera, with the camera's distance from its target held to [minDistance, maxDistance].
 *
 * The radius limits are installed with setCameraLimits, whose clamp runs inside the camera's
 * radius setter. Every write to the radius (wheel inertia, pinch, anything else) is therefore
 * clamped in the same statement, so the bound holds on every frame and zooming still works up to
 * the walls. A camera that starts outside the range is moved inside it before this returns.
 *
 * Returns a function that removes the canvas listeners, the per-frame inertia hook, and the
 * radius limits this call installed. It is idempotent.
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

    // Remember whatever radius limits the camera already had so the cleanup can put them back.
    const priorLower = camera.lowerRadiusLimit;
    const priorUpper = camera.upperRadiusLimit;

    const detachLimits = setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance }, scene);
    const detachControls = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachControls();
        detachLimits();
        camera.lowerRadiusLimit = priorLower;
        camera.upperRadiusLimit = priorUpper;
    };
}
