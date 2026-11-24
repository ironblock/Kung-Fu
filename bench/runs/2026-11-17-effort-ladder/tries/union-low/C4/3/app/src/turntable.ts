import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    const goalAlpha = camera.alpha + 2 * Math.PI * turns;
    return interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
}
