import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * two-finger pinch to zoom) to `camera`, and keeps the camera's radius (its
 * distance from the orbit target) within [minDistance, maxDistance].
 *
 * The range is enforced with the library's radius limits, which clamp every
 * radius write, including pinch, and clamp the current pose immediately.
 *
 * Returns a function that removes the controls and the limits. Calling it more
 * than once is harmless.
 *
 * Caveat: the library only honours the most recent setCameraLimits call on a
 * camera. If other code calls setCameraLimits on this camera later, the limits
 * set here stop applying, and the disposer returned here becomes a no-op.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!(Number.isFinite(minDistance) && Number.isFinite(maxDistance) && minDistance > 0 && minDistance <= maxDistance)) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Clamps the current radius into range right away, and every later radius write.
    const stopLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    let stopControls: () => void;
    try {
        stopControls = attachControl(camera, canvas, scene);
    } catch (error) {
        stopLimits();
        throw error;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        // Remove input first so nothing can move the camera while the limits are being removed.
        stopControls();
        stopLimits();
    };
}
