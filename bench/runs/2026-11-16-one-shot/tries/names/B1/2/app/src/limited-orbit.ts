import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

export function attachLimitedOrbit(
    camera: ArcRotateCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
    minDistance: number,
    maxDistance: number,
): () => void {
    if (!Number.isFinite(minDistance) || !Number.isFinite(maxDistance) || minDistance <= 0 || maxDistance < minDistance) {
        throw new RangeError(`Invalid distance range: min=${minDistance}, max=${maxDistance}`);
    }

    // Keep radius within [minDistance, maxDistance]. A NaN radius is also moved to minDistance.
    const clampRadius = (): void => {
        const r = camera.radius;
        if (!(r >= minDistance)) {
            camera.radius = minDistance;
        } else if (r > maxDistance) {
            camera.radius = maxDistance;
        }
    };

    // Library-level radius limits, which the library's controls respect.
    const releaseLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    // Bring a camera that starts outside the range inside immediately.
    clampRadius();

    // Also re-clamp through the camera's per-update clamp hook, chaining any existing hook.
    const previousClamp = camera._clampToLimits;
    const enforce = (): void => {
        previousClamp?.();
        clampRadius();
    };
    camera._clampToLimits = enforce;

    let releaseControls: () => void;
    try {
        releaseControls = attachControl(camera, canvas, scene);
    } catch (err) {
        camera._clampToLimits = previousClamp;
        releaseLimits();
        throw err;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        if (camera._clampToLimits === enforce) {
            camera._clampToLimits = previousClamp;
        }
        releaseControls();
        releaseLimits();
    };
}
