import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit (arc-rotate) mouse and touch controls
 * to `camera` and keeps its radius (distance from the orbit target) within
 * [minDistance, maxDistance].
 *
 * The range is enforced with setCameraLimits, so it holds for wheel zoom,
 * pinch zoom and any other radius write. If the camera is outside the range
 * when this is called, it is moved inside immediately.
 *
 * The returned function removes the controls and the radius limit.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (
        !Number.isFinite(minDistance) ||
        !Number.isFinite(maxDistance) ||
        minDistance <= 0 ||
        maxDistance < minDistance
    ) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Remember the radius limit fields so the returned function can put them back.
    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Clamps the current radius at once and every later radius write.
    const releaseLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    // Drag to orbit, wheel and pinch to zoom. The scene is needed for drag and wheel to move the camera.
    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;

        detachControls();
        releaseLimits();

        if (previousLower === undefined) {
            delete camera.lowerRadiusLimit;
        } else {
            camera.lowerRadiusLimit = previousLower;
        }
        if (previousUpper === undefined) {
            delete camera.upperRadiusLimit;
        } else {
            camera.upperRadiusLimit = previousUpper;
        }
    };
}
