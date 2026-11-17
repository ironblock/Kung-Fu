import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    const startAlpha = camera.alpha;
    const targetAlpha = startAlpha + 2 * Math.PI * turns;

    return interpolateArcRotateCamera(
        camera,
        scene,
        { alpha: targetAlpha },
        undefined,
        undefined
    );
}
