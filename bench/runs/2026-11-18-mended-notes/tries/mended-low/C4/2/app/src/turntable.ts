import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    const startAlpha = camera.alpha;
    const targetAlpha = startAlpha + 2 * Math.PI * turns;
    const factor = 0.1; // library default interpolationFactor (note 34)

    return new Promise<void>((resolve) => {
        let current = startAlpha;
        let last: number | null = null;
        let done = false;

        const step = (now: number) => {
            if (done) return;

            if (last === null) {
                last = now;
                requestAnimationFrame(step);
                return;
            }

            const dt = Math.max((now - last) / 1000, 1 / 60);
            last = now;

            const remaining = targetAlpha - current;
            const fraction = 1 - Math.pow(2, -dt / factor);
            current += remaining * fraction;

            if (Math.abs(remaining) < 1e-6) {
                camera.alpha = targetAlpha;
                done = true;
                resolve();
            } else {
                camera.alpha = current;
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    });
}
