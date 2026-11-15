import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Attaches the library's default orbit controls (drag to orbit, wheel and
 * pinch to zoom) to `camera` and keeps `camera.radius` within
 * [minDistance, maxDistance].
 *
 * The returned function removes the controls and the radius limits.
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
        minDistance <= 0 ||
        minDistance > maxDistance
    ) {
        throw new RangeError(`Invalid zoom range: [${minDistance}, ${maxDistance}]`);
    }

    // Bring the current radius inside the range immediately, and drop any
    // pending zoom inertia so it cannot push the radius back out.
    camera.inertialRadiusOffset = 0;
    camera.radius = Math.min(maxDistance, Math.max(minDistance, camera.radius));

    const releaseLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );
    const detachControls = attachControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        releaseLimits();
    };
}
