import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera`, with the camera distance (radius) held within
 * [minDistance, maxDistance] at all times.
 *
 * If the camera is currently outside that range it is moved inside as soon as
 * this function is called.
 *
 * Returns a function that removes the controls and the zoom limits.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance <= 0 || maxDistance < minDistance) {
        throw new RangeError(`attachLimitedOrbit: invalid distance range [${minDistance}, ${maxDistance}]`);
    }

    // setCameraLimits clamps the current pose immediately and clamps every
    // later alpha/beta/radius write, so the zoom range holds however far the
    // user scrolls or pinches.
    const disposeLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    // The scene argument is required: without it the controls never move the camera.
    let disposeControls: () => void;
    try {
        disposeControls = attachControl(camera, canvas, scene);
    } catch (err) {
        disposeLimits();
        throw err;
    }

    return () => {
        disposeControls();
        disposeLimits();
    };
}
