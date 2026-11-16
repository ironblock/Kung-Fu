import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * two-finger pinch to zoom) and keeps the camera's radius (its distance from
 * the orbit target) within [minDistance, maxDistance].
 *
 * The radius is clamped by setCameraLimits, which clamps the current pose
 * immediately and clamps every later radius write, including wheel, pinch and
 * inertia, so no per-frame code of ours is needed.
 *
 * Returns a function that removes the controls, stops the clamp, and restores
 * the camera's previous radius limit fields.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!(minDistance > 0) || !(maxDistance >= minDistance)) {
        throw new RangeError(`invalid distance range: min ${minDistance}, max ${maxDistance}`);
    }

    const savedLower = camera.lowerRadiusLimit;
    const savedUpper = camera.upperRadiusLimit;

    // Brings the radius inside the range now and keeps it there from then on.
    // Only the radius fields are passed, so alpha and beta limits are untouched.
    const stopClamp = setCameraLimits(
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
        stopClamp();
        camera.lowerRadiusLimit = savedLower;
        camera.upperRadiusLimit = savedUpper;
    };
}
