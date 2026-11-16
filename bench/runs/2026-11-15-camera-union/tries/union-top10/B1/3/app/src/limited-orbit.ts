import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * two-finger pinch to zoom) to `camera`, and keeps the camera's radius (its
 * distance from the orbit target) within [minDistance, maxDistance] at all times.
 *
 * The scene is passed to both helpers on purpose: without it, drags and the
 * mouse wheel only accumulate inertia that is never applied.
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
    if (!(minDistance >= 0 && maxDistance >= minDistance)) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 <= minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Set limits first: this clamps the current radius into range immediately,
    // and makes every later radius write (wheel and pinch alike) clamp as well.
    const releaseLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (err) {
        releaseLimits();
        throw err;
    }

    return () => {
        detachControls();
        releaseLimits();
    };
}
