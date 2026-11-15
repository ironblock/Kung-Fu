import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit controls (drag to orbit, wheel and pinch
 * to zoom) to an ArcRotateCamera, keeping its radius (distance from the orbit
 * target) within [minDistance, maxDistance].
 *
 * The radius bounds are enforced by the camera's own setter clamp
 * (setCameraLimits), so both wheel inertia and pinch writes are held at the
 * limits on every mutation. If the camera starts outside the range, it is moved
 * inside immediately.
 *
 * @returns A cleanup function that removes the canvas listeners, the per-frame
 * inertia hook, and the radius limits this call installed. Safe to call twice.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || !(minDistance > 0) || maxDistance < minDistance) {
        throw new RangeError(
            `attachLimitedOrbit: expected finite 0 < minDistance <= maxDistance, got ${minDistance}..${maxDistance}`,
        );
    }

    // Remember any radius bounds the caller already set so cleanup can restore them.
    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Install the radius clamp first: this snaps an out-of-range camera into
    // range immediately, before any input or frame can see it.
    const releaseLimits = setCameraLimits(camera, {
        lowerRadiusLimit: minDistance,
        upperRadiusLimit: maxDistance,
    });

    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        releaseLimits();
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };
}
