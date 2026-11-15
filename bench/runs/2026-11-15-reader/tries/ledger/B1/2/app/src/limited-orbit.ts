import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attach the library's orbit controls to `camera` with the camera's distance from its
 * orbit target held between `minDistance` and `maxDistance`.
 *
 * The range is enforced by the library's radius setter (via `setCameraLimits`), which
 * runs on every radius write: wheel zoom and inertia, pinch zoom and any other writer.
 * Nothing is added to the per-frame loop, so the range holds on every frame, including
 * the frame in which an input overshoots.
 *
 * The camera is clamped into the range as soon as this is called.
 *
 * @returns A function that removes the controls, their canvas listeners and the zoom range
 * (restoring the camera's previous `lowerRadiusLimit`/`upperRadiusLimit`). Safe to call twice.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number
): () => void {
    if (!(Number.isFinite(minDistance) && Number.isFinite(maxDistance) && minDistance > 0 && minDistance <= maxDistance)) {
        throw new RangeError(`attachLimitedOrbit: expected 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`);
    }

    const previousLower = camera.lowerRadiusLimit;
    const previousUpper = camera.upperRadiusLimit;

    // Limits first: this clamps the current pose right away, so the controls never see an out-of-range camera.
    const detachLimits = setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance });
    const detachControls = attachControl(camera, canvas, scene);

    let attached = true;
    return () => {
        if (!attached) {
            return;
        }
        attached = false;
        detachControls();
        detachLimits();
        camera.lowerRadiusLimit = previousLower;
        camera.upperRadiusLimit = previousUpper;
    };
}
