import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Gives an arc-rotate camera the library's mouse/touch orbit and zoom controls,
 * with the camera's radius (distance from its target) kept within
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
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance <= 0 || minDistance > maxDistance) {
        throw new RangeError(`Invalid zoom range: min ${minDistance}, max ${maxDistance}`);
    }

    // Remember the limit fields so the camera is left as we found it on dispose.
    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Set limits before attaching controls: this clamps the current pose at once,
    // and every later radius write (wheel, pinch, inertia) is clamped as it happens.
    const stopLimits = setCameraLimits(
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
        stopLimits();
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };
}
