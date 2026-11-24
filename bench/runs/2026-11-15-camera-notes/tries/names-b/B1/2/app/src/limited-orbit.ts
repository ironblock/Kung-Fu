import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera` and keeps the camera's radius (distance from its
 * target) within [minDistance, maxDistance].
 *
 * The camera is clamped immediately if it starts outside the range.
 * The returned function removes the controls and the limits.
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
            `attachLimitedOrbit: expected 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Bring the camera inside the range right away.
    camera.radius = Math.min(Math.max(camera.radius, minDistance), maxDistance);

    // Radius limits enforced by the library, including during inertia and wheel/pinch input.
    const detachLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (error) {
        detachLimits();
        throw error;
    }

    return () => {
        detachControls();
        detachLimits();
    };
}
