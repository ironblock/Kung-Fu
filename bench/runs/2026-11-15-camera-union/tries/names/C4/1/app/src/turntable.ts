import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

/**
 * Glides an arc-rotate camera around its target by `turns` full turns,
 * in the direction in which `alpha` grows. Only `alpha` is driven; radius,
 * beta and target are left untouched. Resolves once the camera has arrived
 * at `startAlpha + 2π · turns`.
 */
export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    if (!Number.isFinite(turns) || turns < 0) {
        return Promise.reject(new RangeError(`turns must be a finite number >= 0, got ${turns}`));
    }

    const goalAlpha = camera.alpha + 2 * Math.PI * turns;
    return interpolateArcRotateCamera(camera, scene, { alpha: goalAlpha });
}
