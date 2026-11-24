import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `canvas`, and keeps `camera.radius` within
 * [minDistance, maxDistance].
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
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance)) {
        throw new RangeError("attachLimitedOrbit: minDistance and maxDistance must be finite numbers");
    }
    if (minDistance < 0 || maxDistance < minDistance) {
        throw new RangeError("attachLimitedOrbit: require 0 <= minDistance <= maxDistance");
    }

    // Bring the camera inside the range now, and drop any pending zoom
    // inertia that would otherwise carry it back out.
    const clampRadius = (): void => {
        const r = Number.isFinite(camera.radius) ? camera.radius : minDistance;
        const clamped = Math.min(maxDistance, Math.max(minDistance, r));
        if (clamped !== camera.radius) {
            camera.radius = clamped;
        }
        camera.inertialRadiusOffset = 0;
    };

    const releaseLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    let releaseControls: (() => void) | undefined;
    try {
        clampRadius();
        releaseControls = attachControl(camera, canvas, scene);
    } catch (err) {
        releaseLimits();
        throw err;
    }

    let disposed = false;
    return (): void => {
        if (disposed) return;
        disposed = true;
        releaseControls?.();
        releaseLimits();
    };
}
