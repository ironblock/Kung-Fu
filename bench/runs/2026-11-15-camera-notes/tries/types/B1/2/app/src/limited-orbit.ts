import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's standard orbit controls (drag to orbit, wheel and
 * two-finger pinch to zoom) to `camera`, with the camera distance from its
 * orbit target clamped to `[minDistance, maxDistance]`.
 *
 * The radius clamp is installed through `setCameraLimits`, which snaps the
 * radius inside the setter that writes it, so every input path (wheel, pinch,
 * inertia) is bounded. If the camera starts outside the range it is moved
 * inside as soon as this function is called.
 *
 * @returns A cleanup function that removes the canvas listeners, the per-frame
 * inertia hook, and the radius clamp, and restores the camera's previous radius
 * limits. Safe to call more than once.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!(minDistance > 0 && minDistance < Infinity && maxDistance >= minDistance)) {
        throw new RangeError(`attachLimitedOrbit: invalid distance range [${minDistance}, ${maxDistance}]`);
    }

    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Install the clamp first so the camera is pulled into range before any input is accepted.
    const releaseRadiusClamp = setCameraLimits(camera, {
        lowerRadiusLimit: minDistance,
        upperRadiusLimit: maxDistance,
    });

    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (error) {
        releaseRadiusClamp();
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
        throw error;
    }

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detachControls();
        releaseRadiusClamp();
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };
}
