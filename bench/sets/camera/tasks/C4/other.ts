import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Another right answer: fixed legs of a third of a turn, a slower ease, and an exact last leg.
export async function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    const goal = camera.alpha + 2 * Math.PI * turns;
    const leg = (2 * Math.PI) / 3;
    while (goal - camera.alpha > leg) {
        await interpolateArcRotateCamera(camera, scene, { alpha: camera.alpha + leg }, undefined, { interpolationFactor: 0.15 });
    }
    await interpolateArcRotateCamera(camera, scene, { alpha: goal }, undefined, { interpolationFactor: 0.15 });
}
