import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit/pan/zoom controls to an arc-rotate camera,
 * with the camera's radius (distance from its orbit target) clamped to
 * [minDistance, maxDistance].
 *
 * The radius bounds are enforced by the camera's own setters (via setCameraLimits),
 * so they hold on every write, including wheel and pinch zoom and inertia overshoot.
 * If the camera starts outside the range, it is moved inside immediately.
 *
 * @returns A cleanup function that removes the canvas listeners, the per-frame
 * inertia hook, and the radius limits. Safe to call more than once.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance)) {
        throw new RangeError("minDistance and maxDistance must be finite numbers");
    }
    if (minDistance < 0 || minDistance > maxDistance) {
        throw new RangeError("Require 0 <= minDistance <= maxDistance");
    }

    // Set the limits first so the current pose is clamped into range before any input is accepted.
    const releaseLimits = setCameraLimits(camera, {
        lowerRadiusLimit: minDistance,
        upperRadiusLimit: maxDistance,
    });
    const detachControls = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detachControls();
        releaseLimits();
    };
}
