import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export async function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    const start = camera.alpha;
    const total = 2 * Math.PI * turns;
    // The transition takes the shortest way to each goal angle, so go in legs of less than half a turn.
    const legs = Math.max(1, Math.ceil(Math.abs(total) / (Math.PI / 2)));
    for (let i = 1; i <= legs; i++) {
        await interpolateArcRotateCamera(camera, scene, { alpha: start + (total * i) / legs });
    }
}
