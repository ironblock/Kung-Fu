import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attach the library's orbit controls to `camera` on `canvas`, with the camera's
 * distance from its orbit target kept within [minDistance, maxDistance].
 *
 * The radius bounds are enforced by the library's setCameraLimits self-clamp hook,
 * which runs on every radius write (wheel, pinch, inertia), so the limit holds at
 * every frame. Only radius bounds are set; alpha and beta stay unbounded.
 *
 * The returned function detaches the controls and removes the radius clamp. It is
 * idempotent.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!(Number.isFinite(minDistance) && minDistance > 0)) {
        throw new RangeError(`minDistance must be a finite number > 0, got ${minDistance}`);
    }
    if (!(Number.isFinite(maxDistance) && maxDistance >= minDistance)) {
        throw new RangeError(
            `maxDistance must be a finite number >= minDistance, got ${maxDistance} (minDistance ${minDistance})`,
        );
    }

    // Clamps the current radius into range immediately, before any input can arrive.
    const releaseLimits = setCameraLimits(camera, {
        lowerRadiusLimit: minDistance,
        upperRadiusLimit: maxDistance,
    });

    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (error) {
        releaseLimits();
        throw error;
    }

    let attached = true;
    return () => {
        if (!attached) {
            return;
        }
        attached = false;
        detachControls();
        releaseLimits();
    };
}
