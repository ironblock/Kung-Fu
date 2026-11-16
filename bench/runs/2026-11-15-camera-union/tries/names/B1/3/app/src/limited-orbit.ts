import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard mouse/touch orbit controls to `camera` and
 * keeps `camera.radius` (distance from the orbit target) within
 * [minDistance, maxDistance].
 *
 * The range is enforced through the library's radius limits (`setCameraLimits`),
 * which also run per frame via the scene, and the radius is clamped once
 * immediately so a camera that starts outside the range is corrected on call.
 *
 * Returns a function that removes the controls and the limits.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!(minDistance > 0) || !Number.isFinite(maxDistance) || !(maxDistance >= minDistance)) {
        throw new RangeError(
            `attachLimitedOrbit: expected 0 < minDistance <= maxDistance (finite), got ${minDistance}..${maxDistance}`,
        );
    }

    const removeLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    let removeControls: (() => void) | undefined;
    try {
        // Bring an out-of-range starting radius inside immediately.
        if (camera.radius < minDistance) {
            camera.radius = minDistance;
        } else if (camera.radius > maxDistance) {
            camera.radius = maxDistance;
        }

        removeControls = attachControl(camera, canvas, scene);
    } catch (err) {
        removeLimits();
        throw err;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        removeControls?.();
        removeLimits();
    };
}
