import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

/**
 * Glides an arc-rotate camera around its target by `turns` full turns, in the
 * direction in which `alpha` grows. Distance, beta and target are left as they are.
 * Resolves once the camera has arrived at `startAlpha + 2π · turns`.
 */
export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    // Stop any pending drag/wheel inertia from moving the camera during the tour.
    camera.inertialAlphaOffset = 0;
    camera.inertialBetaOffset = 0;
    camera.inertialRadiusOffset = 0;
    camera.inertialPanningX = 0;
    camera.inertialPanningY = 0;

    const goalAlpha = camera.alpha + 2 * Math.PI * turns;

    // Pass the current beta, radius and target explicitly so they are held fixed.
    // The target is copied, not shared, so the camera's own object is not aliased.
    return interpolateArcRotateCamera(camera, scene, {
        alpha: goalAlpha,
        beta: camera.beta,
        radius: camera.radius,
        target: { x: camera.target.x, y: camera.target.y, z: camera.target.z },
    });
}
