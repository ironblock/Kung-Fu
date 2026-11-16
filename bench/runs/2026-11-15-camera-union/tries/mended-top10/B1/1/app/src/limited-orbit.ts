import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Gives an arc-rotate camera the library's mouse and touch controls (drag to
 * orbit, wheel and pinch to zoom), with the camera distance kept between
 * `minDistance` and `maxDistance`.
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
    if (!(Number.isFinite(minDistance) && Number.isFinite(maxDistance) && minDistance > 0 && minDistance <= maxDistance)) {
        throw new RangeError(`attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`);
    }

    // Limits first, so no input can take the radius outside the range.
    // Only the radius limits are passed; alpha and beta stay unlimited.
    const releaseLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    // Bring a camera that starts outside the range inside now. The write is
    // made explicitly, because setCameraLimits only clamps writes that change
    // the value.
    camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));

    // A scene is passed so drag and wheel input are applied on each frame.
    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        releaseLimits();
    };
}
