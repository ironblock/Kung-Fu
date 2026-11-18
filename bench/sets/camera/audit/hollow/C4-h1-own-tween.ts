import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Hollow try C4-h1: its own per-frame tween (smoothstep over a fixed number of frames) on the scene's
// before-render list, not the library's camera-transition easing.
export function spinAround(camera: ArcRotateCamera, scene: SceneContext, turns: number): Promise<void> {
    const start = camera.alpha;
    const total = 2 * Math.PI * turns;
    const frames = Math.max(1, Math.ceil(60 * Math.abs(turns)) * 2);
    let i = 0;
    return new Promise((resolve) => {
        const step = (): void => {
            i++;
            const u = Math.min(1, i / frames);
            camera.alpha = start + total * u * u * (3 - 2 * u);
            if (u >= 1) {
                const at = scene._beforeRender.indexOf(step);
                if (at >= 0) scene._beforeRender.splice(at, 1);
                resolve();
            }
        };
        scene._beforeRender.push(step);
    });
}
