import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `canvas`, and keeps the camera's radius (distance from its
 * target) within [minDistance, maxDistance].
 *
 * The range is enforced through the camera's radius limits, so it applies to
 * wheel, pinch and inertia alike. A camera that starts outside the range is
 * moved inside it immediately.
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
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance < 0 || maxDistance < minDistance) {
        throw new RangeError(`attachLimitedOrbit: invalid distance range [${minDistance}, ${maxDistance}]`);
    }

    // Bring the starting radius inside the range before any input can arrive.
    camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));

    // Limits first, so they are in force before the first wheel or pinch event.
    const detachLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (error) {
        detachLimits();
        throw error;
    }

    return () => {
        detachControls();
        detachLimits();
    };
}
