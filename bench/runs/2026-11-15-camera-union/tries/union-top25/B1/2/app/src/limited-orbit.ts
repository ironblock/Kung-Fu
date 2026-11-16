import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera`, with the radius (distance from the orbit point)
 * held between `minDistance` and `maxDistance`.
 *
 * The limits are installed before the controls, so a camera that starts
 * outside the range is moved inside it as soon as this is called. Every later
 * radius write (wheel inertia, pinch) is clamped by the library.
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
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || !(minDistance > 0) || !(maxDistance >= minDistance)) {
        throw new RangeError(`attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`);
    }

    // setCameraLimits is what makes the radius limits take effect: hand-set
    // lowerRadiusLimit/upperRadiusLimit fields alone do not clamp writes.
    const releaseLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    // The scene argument is required: without it, drag and wheel input does
    // not move the camera.
    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        // attachControl's returned function is the only thing that removes
        // its canvas listeners; disposing the scene does not.
        detachControls();
        releaseLimits();
    };
}
