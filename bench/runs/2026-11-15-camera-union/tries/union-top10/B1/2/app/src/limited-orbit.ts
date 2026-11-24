import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to an ArcRotateCamera, and keeps the camera's radius (its
 * distance from the orbit target) within [minDistance, maxDistance].
 *
 * The radius limits are installed with setCameraLimits, which clamps the
 * camera immediately (so an out-of-range starting distance is corrected at
 * once) and clamps every later radius write, including the wheel and pinch
 * input applied on each frame.
 *
 * The returned function removes the controls and the limits.
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
        minDistance < 0 ||
        maxDistance < minDistance
    ) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 <= minDistance <= maxDistance, got ${minDistance}, ${maxDistance}`,
        );
    }

    // Install the limits first so the camera is pulled into range right away,
    // before any input can reach it.
    const removeLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );
    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        // Stop input first, then drop the limits.
        detachControls();
        removeLimits();
    };
}
