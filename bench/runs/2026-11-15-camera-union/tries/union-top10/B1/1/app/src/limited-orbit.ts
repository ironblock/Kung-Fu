import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Gives an arc-rotate camera the library's standard mouse/touch controls
 * (drag to orbit, wheel and pinch to zoom) while keeping its radius, the
 * distance from the orbit target, between `minDistance` and `maxDistance`.
 *
 * The radius limits are installed with `setCameraLimits`, which clamps the
 * camera at once if it starts outside the range, and clamps every later
 * radius write. The returned function removes the controls and the limits.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance)) {
        throw new RangeError("attachLimitedOrbit: minDistance and maxDistance must be finite numbers");
    }
    if (minDistance <= 0 || minDistance > maxDistance) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Set the limits before the controls exist, so the camera is brought
    // inside the range immediately and no input can arrive unclamped.
    const removeLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );
    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        removeLimits();
    };
}
