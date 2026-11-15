import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's orbit mouse/touch controls to `camera` and keeps the
 * camera's distance from its target (its radius) within [minDistance, maxDistance].
 *
 * The range is enforced by setCameraLimits, which clamps every radius write,
 * so wheel zoom, pinch and the inertial zoom offset can never leave the range.
 * If the camera starts outside the range it is moved inside immediately.
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
    if (!(minDistance > 0) || !Number.isFinite(maxDistance) || !(maxDistance >= minDistance)) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Clamps the current pose now and clamps every later radius write.
    const disposeLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    // The scene is required: drag and wheel only move the camera through the
    // scene's per-frame update.
    let disposeControls: () => void;
    try {
        disposeControls = attachControl(camera, canvas, scene);
    } catch (err) {
        disposeLimits();
        throw err;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        disposeControls();
        disposeLimits();
    };
}
