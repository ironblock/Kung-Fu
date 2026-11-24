import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit controls (drag to orbit, wheel and pinch
 * to zoom) to `camera`, with its distance from the orbit target clamped to
 * [minDistance, maxDistance].
 *
 * The radius limits are enforced by the camera's own setters (via
 * `setCameraLimits`), so zoom input can never leave the range, including
 * inertial overshoot and pinch writes. If the camera is already outside the
 * range, it is moved inside immediately.
 *
 * @returns A cleanup function that removes the canvas listeners, the per-frame
 * inertia hook, and the radius clamp. Safe to call more than once.
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
            `attachLimitedOrbit: need finite 0 <= minDistance <= maxDistance, got ${minDistance}..${maxDistance}`,
        );
    }

    // Installs the radius clamp and snaps the current radius into range now.
    const releaseLimits = setCameraLimits(camera, {
        lowerRadiusLimit: minDistance,
        upperRadiusLimit: maxDistance,
    });
    const detachControls = attachControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        // Stop input first so nothing can write the radius while the clamp is removed.
        detachControls();
        releaseLimits();
    };
}
