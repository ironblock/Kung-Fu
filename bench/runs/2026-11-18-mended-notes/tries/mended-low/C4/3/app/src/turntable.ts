import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Glides an ArcRotateCamera around its target by `turns` full turns in the
 * direction of increasing alpha, using the same exponential easing the
 * library's interpolateArcRotateCamera applies (factor 0.1 s).
 *
 * beta, radius and target are left untouched.  The promise resolves once
 * alpha has reached startAlpha + 2π·turns.
 */
export function spinAround(
    camera: ArcRotateCamera,
    scene: SceneContext,
    turns: number,
): Promise<void> {
    const startAlpha = camera.alpha;
    const targetAlpha = startAlpha + 2 * Math.PI * turns;
    const factor = 0.1; // matches interpolateArcRotateCamera default
    const EPSILON = 1e-4; // radians; snap threshold

    // No movement needed.
    if (Math.abs(targetAlpha - startAlpha) < EPSILON) {
        return Promise.resolve();
    }

    let lastTime: number | null = null;
    let finished = false;

    return new Promise<void>((resolve) => {
        const hook = (): void => {
            if (finished) return;

            const now = performance.now();
            if (lastTime === null) {
                lastTime = now;
                return;
            }

            let dt = (now - lastTime) / 1000;
            lastTime = now;
            if (dt <= 0) dt = 1 / 60;

            const remaining = targetAlpha - camera.alpha;

            if (Math.abs(remaining) <= EPSILON) {
                camera.alpha = targetAlpha;
                finished = true;
                const arr: unknown[] = (scene as Record<string, unknown>)._beforeRender as unknown[];
                const idx = arr.indexOf(hook);
                if (idx !== -1) arr.splice(idx, 1);
                resolve();
                return;
            }

            // Same per-frame formula as interpolateArcRotateCamera:
            // advance (1 − 2^(−dt/factor)) of the remaining angular distance.
            const fraction = 1 - Math.pow(2, -dt / factor);
            camera.alpha += remaining * fraction;
        };

        ((scene as Record<string, unknown>)._beforeRender as unknown[]).push(hook);
    });
}
