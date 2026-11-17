import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    const startAlpha = camera.alpha;
    const targetAlpha = startAlpha + 2 * Math.PI * turns;

    if (targetAlpha === startAlpha) {
        return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
        let lastTime: number | null = null;

        const step = (time: number) => {
            if (lastTime === null) {
                lastTime = time;
                requestAnimationFrame(step);
                return;
            }

            let dt = (time - lastTime) / 1000;
            lastTime = time;

            if (dt <= 0) dt = 1 / 60;

            const fraction = 1 - Math.pow(2, -dt / 0.1);
            const remaining = targetAlpha - camera.alpha;
            camera.alpha += remaining * fraction;

            if (Math.abs(targetAlpha - camera.alpha) < 1e-6) {
                camera.alpha = targetAlpha;
                resolve();
                return;
            }

            requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    });
}
