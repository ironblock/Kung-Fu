import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's mouse/touch orbit controls to `camera` and keeps the
 * camera's radius (distance from the orbit target) within [minDistance, maxDistance].
 *
 * Radius limits are enforced through setCameraLimits, which clamps the current
 * pose immediately and clamps every later radius write, including wheel, pinch
 * and inertia. Writing the limit fields directly would not enforce anything.
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
    if (
        !Number.isFinite(minDistance) ||
        !Number.isFinite(maxDistance) ||
        minDistance <= 0 ||
        minDistance > maxDistance
    ) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    const savedLower = camera.lowerRadiusLimit;
    const savedUpper = camera.upperRadiusLimit;

    // Limits first, so a camera that starts outside the range is brought inside
    // before any input can arrive.
    const releaseLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );
    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        detachControls();
        releaseLimits();
        camera.lowerRadiusLimit = savedLower;
        camera.upperRadiusLimit = savedUpper;
    };
}
