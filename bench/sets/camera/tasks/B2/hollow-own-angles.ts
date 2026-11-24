import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Hollow try, the G1 kind: accessors on camera.alpha and camera.beta with their own storage, which double
// every change written to them. The controls write alpha += offset each frame, so the read-back turn is
// twice the default. The camera's own setters are never called: its world matrix never turns.
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const own = { alpha: Object.getOwnPropertyDescriptor(camera, "alpha"), beta: Object.getOwnPropertyDescriptor(camera, "beta") };
    for (const key of ["alpha", "beta"] as const) {
        let value = camera[key];
        Object.defineProperty(camera, key, {
            get: () => value,
            set: (v: number) => {
                value += 2 * (v - value);
            },
            configurable: true,
            enumerable: true,
        });
    }
    const detach = attachControl(camera, canvas, scene);
    return () => {
        detach();
        for (const key of ["alpha", "beta"] as const) {
            const d = own[key];
            if (d) Object.defineProperty(camera, key, d);
        }
    };
}
