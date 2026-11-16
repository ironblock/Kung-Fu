import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

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
        throw new RangeError(
            `attachLimitedOrbit: need 0 < minDistance <= maxDistance, got ${minDistance} and ${maxDistance}`,
        );
    }

    // Pending radius inertia could carry the camera out of range, so drop it.
    camera.inertialRadiusOffset = 0;

    // Bring the current distance inside the range immediately.
    const current = Number.isFinite(camera.radius) ? camera.radius : minDistance;
    camera.radius = Math.min(maxDistance, Math.max(minDistance, current));

    // Enforce the radius range through the library's limits mechanism.
    const releaseLimits = setCameraLimits(
        camera,
        { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance },
        scene,
    );

    let detachControls: () => void;
    try {
        detachControls = attachControl(camera, canvas, scene);
    } catch (error) {
        releaseLimits();
        throw error;
    }

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        detachControls();
        releaseLimits();
    };
}
