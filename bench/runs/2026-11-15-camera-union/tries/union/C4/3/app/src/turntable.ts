import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = 2 * Math.PI;

// interpolateArcRotateCamera takes the shortest arc (mod 2π) to its alpha goal,
// so a single goal more than π away would turn the wrong way or not at all.
// Each leg is therefore kept well under π and the legs run back to back.
const MAX_LEG = 0.75 * Math.PI;

/**
 * Glides an arc-rotate camera around its target by `turns` full turns, in the
 * direction in which alpha grows. Distance, beta and target are left as they are.
 * Resolves when alpha equals its starting value plus 2π · turns.
 */
export async function spinAround(
    camera: ArcRotateCamera,
    scene: SceneContext,
    turns: number
): Promise<void> {
    if (!Number.isFinite(turns) || turns < 0) {
        throw new RangeError(`spinAround: turns must be a finite number >= 0, got ${turns}`);
    }

    const start = camera.alpha;
    const total = TWO_PI * turns;
    if (total === 0) {
        return;
    }

    const end = start + total;
    const lower = camera.lowerAlphaLimit ?? -Infinity;
    const upper = camera.upperAlphaLimit ?? Infinity;
    if (end < lower || end > upper) {
        // Checked up front: the library clamps alpha goals to the limits, so the
        // camera would stop short of the requested turn without any error.
        throw new RangeError("spinAround: the turn would pass the camera's alpha limits");
    }

    const legs = Math.ceil(total / MAX_LEG);
    const step = total / legs;

    // Hold everything except alpha at its current value.
    const beta = camera.beta;
    const radius = camera.radius;

    for (let i = 1; i <= legs; i++) {
        const goalAlpha = i === legs ? end : start + step * i;
        await interpolateArcRotateCamera(camera, scene, {
            alpha: goalAlpha,
            beta,
            radius,
            target: { x: camera.target.x, y: camera.target.y, z: camera.target.z },
        });
    }
}
