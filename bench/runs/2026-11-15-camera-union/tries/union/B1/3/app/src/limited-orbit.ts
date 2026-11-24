import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Gives an orbit camera the library's mouse and touch controls (drag to orbit,
 * wheel and pinch to zoom) while keeping its radius, the distance from the
 * orbited point, within [minDistance, maxDistance].
 *
 * Returns a function that removes the controls and restores the camera's
 * previous radius limits.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance <= 0 || maxDistance < minDistance) {
        throw new RangeError(`attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`);
    }

    // Remember the limit fields so disposing can put them back.
    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Clamps the current radius at once, and clamps every later radius write
    // (wheel, pinch, and drag offsets alike) to the range. Only radius fields are
    // passed, so alpha and beta are left alone.
    const stopClamp = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    // The scene is passed so drags and the wheel move the camera each frame.
    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (err) {
        stopClamp();
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
        throw err;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        stopClamp();
        // Limit fields are plain data once the clamp is stopped; put back what was there.
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };
}
