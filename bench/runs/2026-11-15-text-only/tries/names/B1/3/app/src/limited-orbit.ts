import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard arc-rotate mouse/touch controls to `camera`
 * and keeps the camera's radius (distance from its orbit target) within
 * [minDistance, maxDistance] on every frame.
 *
 * If the camera currently sits outside that range it is moved inside
 * immediately. The returned function removes the controls and the radius
 * limits, leaving no listeners on the canvas and no per-frame work behind.
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
    if (minDistance < 0 || minDistance > maxDistance) {
        throw new RangeError("attachLimitedOrbit: require 0 <= minDistance <= maxDistance");
    }

    // Bring a camera that starts outside the range inside right away.
    const clamped = Math.min(Math.max(camera.radius, minDistance), maxDistance);
    if (clamped !== camera.radius) {
        camera.radius = clamped;
        // Discard any pending zoom motion that was pushing the radius out of range.
        camera.inertialRadiusOffset = 0;
    }

    // Enforce the radius range each frame, including while zoom inertia is running.
    const disposeLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    let disposeControl: (() => void) | undefined;
    try {
        disposeControl = attachControl(camera, canvas, scene);
    } catch (err) {
        disposeLimits();
        throw err;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        disposeControl?.();
        disposeLimits();
    };
}
