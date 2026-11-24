import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * two-finger pinch to zoom) to an ArcRotateCamera, with the camera's radius
 * (its distance from the orbit target) kept within [minDistance, maxDistance].
 *
 * The bound is enforced by setCameraLimits, which clamps the camera's current
 * pose immediately and clamps every later write to alpha/beta/radius, so wheel
 * and pinch input cannot push the radius out of range.
 *
 * Returns a function that removes the controls and the radius limit.
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

    // Set the limits first so the camera is brought inside the range before any
    // input or frame can move it.
    const stopLimits = setCameraLimits(
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
        stopLimits();
    };
}
