import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    const targetAlpha = camera.alpha + 2 * Math.PI * turns;
    return interpolateArcRotateCamera(camera, scene, { alpha: targetAlpha });
}
