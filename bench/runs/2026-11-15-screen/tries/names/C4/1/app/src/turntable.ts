import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

/**
 * Glides an arc-rotate camera around its target by `turns` full turns,
 * increasing `alpha`, using the library's camera-transition easing.
 * Only alpha changes; beta, radius and target are held at their current values.
 * Resolves once the camera has arrived at `startAlpha + 2π · turns`.
 */
export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    const startAlpha = camera.alpha;
    const goalAlpha = startAlpha + 2 * Math.PI * turns;

    return interpolateArcRotateCamera(camera, scene, {
        alpha: goalAlpha,
        beta: camera.beta,
        radius: camera.radius,
        target: { x: camera.target.x, y: camera.target.y, z: camera.target.z },
    });
}
