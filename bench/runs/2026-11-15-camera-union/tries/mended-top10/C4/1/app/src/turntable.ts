import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Glides an arc-rotate camera around its target by `turns` full turns
 * (alpha grows by 2π · turns), using the library's own camera-transition
 * easing. Beta, radius and target are kept at their current values.
 * Resolves when the camera has arrived.
 */
export function spinAround(
    camera: ArcRotateCamera,
    scene: SceneContext,
    turns: number
): Promise<void> {
    const target = camera.target;
    return interpolateArcRotateCamera(camera, scene, {
        alpha: camera.alpha + 2 * Math.PI * turns,
        beta: camera.beta,
        radius: camera.radius,
        // Copy the target so the goal is not the camera's live object.
        target: { x: target.x, y: target.y, z: target.z },
    });
}
