import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

/**
 * Gives an arc-rotate camera the library's standard mouse/touch controls
 * (drag to orbit, wheel and pinch to zoom) while keeping the radius between
 * `minDistance` and `maxDistance`.
 *
 * The range is enforced with the library's own radius limits (setCameraLimits),
 * which clamp the current pose immediately and clamp every later radius write,
 * so it holds on every frame however much the user scrolls or pinches.
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
    if (
        !Number.isFinite(minDistance) ||
        !Number.isFinite(maxDistance) ||
        minDistance < 0 ||
        maxDistance < minDistance
    ) {
        throw new RangeError(
            `attachLimitedOrbit: need 0 <= minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Limits go first: this pulls the camera inside the range right away and
    // zeroes any pending radius offset, so later zoom input starts from a valid pose.
    const releaseLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    let releaseControls: () => void;
    try {
        releaseControls = attachControl(camera, canvas, scene);
    } catch (error) {
        releaseLimits();
        throw error;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        releaseControls();
        releaseLimits();
    };
}
