import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Gives an orbit camera the library's mouse and touch controls (drag to orbit,
 * wheel and pinch to zoom) while keeping its radius, the distance from the
 * orbited target, within [minDistance, maxDistance].
 *
 * Returns a function that removes the controls and the radius limits.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number
): () => void {
    if (
        !Number.isFinite(minDistance) ||
        !Number.isFinite(maxDistance) ||
        minDistance <= 0 ||
        minDistance > maxDistance
    ) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`
        );
    }

    // The scene is passed so that drags and wheel input are applied each frame.
    const detachControls = attachControl(camera, canvas, scene);

    let detachLimits: () => void;
    try {
        // Limits on radius: wheel and pinch input are clamped to them.
        detachLimits = setCameraLimits(
            camera,
            { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
            scene
        );
    } catch (err) {
        detachControls();
        throw err;
    }

    // Bring a camera that starts outside the range inside it right away.
    camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detachLimits();
        detachControls();
    };
}
