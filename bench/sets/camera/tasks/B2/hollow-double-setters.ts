import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Double every change the controls make to the angles, by wrapping the camera's own angle setters.
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const saved: PropertyDescriptor[] = [];
    for (const key of ["alpha", "beta"] as const) {
        const own = Object.getOwnPropertyDescriptor(camera, key)!;
        saved.push(own);
        Object.defineProperty(camera, key, {
            configurable: true,
            enumerable: true,
            get: () => own.get!.call(camera),
            set: (v: number) => {
                const old = own.get!.call(camera) as number;
                own.set!.call(camera, old + 2 * (v - old));
            },
        });
    }
    const detach = attachControl(camera, canvas, scene);
    return () => {
        detach();
        Object.defineProperty(camera, "alpha", saved[0]!);
        Object.defineProperty(camera, "beta", saved[1]!);
    };
}
