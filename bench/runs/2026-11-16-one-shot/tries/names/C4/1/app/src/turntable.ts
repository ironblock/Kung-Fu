import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    const goalAlpha = camera.alpha + 2 * Math.PI * turns;
    const { x, y, z } = camera.target;

    return interpolateArcRotateCamera(camera, scene, {
        alpha: goalAlpha,
        beta: camera.beta,
        radius: camera.radius,
        target: { x, y, z },
    });
}
