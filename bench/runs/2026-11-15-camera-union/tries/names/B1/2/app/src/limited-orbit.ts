import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's standard orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera` and keeps `camera.radius` within
 * [minDistance, maxDistance] at all times.
 *
 * Returns a function that removes the controls and restores the camera.
 */
export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance <= 0 || minDistance > maxDistance) {
        throw new RangeError(`Invalid zoom range: [${minDistance}, ${maxDistance}]`);
    }

    // Library-side radius limits.
    const disposeLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    // Hard clamp: radius (and any pending radius inertia) must never leave the range.
    const clampRadius = (): void => {
        const r = camera.radius;
        if (r >= minDistance && r <= maxDistance) {
            return;
        }
        camera.radius = Number.isNaN(r) ? minDistance : Math.min(maxDistance, Math.max(minDistance, r));
        camera.inertialRadiusOffset = 0;
    };

    // Bring a camera that starts outside the range inside right away.
    clampRadius();

    // Run after whatever clamp was already installed (e.g. by setCameraLimits),
    // so the radius is re-clamped at the end of each library clamp pass.
    const previousClamp = camera._clampToLimits;
    const ownClamp = (): void => {
        previousClamp?.();
        clampRadius();
    };
    camera._clampToLimits = ownClamp;

    const detachControls = attachControl(camera, canvas, scene);

    return () => {
        detachControls();
        disposeLimits();
        if (camera._clampToLimits === ownClamp) {
            camera._clampToLimits = previousClamp;
        }
    };
}
