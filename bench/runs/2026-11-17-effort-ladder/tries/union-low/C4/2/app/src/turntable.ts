import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    const totalDelta = 2 * Math.PI * turns;
    if (totalDelta <= 0) return Promise.resolve();

    const startAlpha = camera.alpha;
    const chunkSize = Math.PI;

    const chunks: number[] = [];
    let remaining = totalDelta;
    while (remaining > 0) {
        const chunk = Math.min(chunkSize, remaining);
        chunks.push(chunk);
        remaining -= chunk;
    }

    let promise: Promise<void> = Promise.resolve();
    let currentAlpha = startAlpha;

    for (const chunk of chunks) {
        currentAlpha += chunk;
        const goal = { alpha: currentAlpha };
        promise = promise.then(() => interpolateArcRotateCamera(camera, scene, goal));
    }

    return promise;
}
