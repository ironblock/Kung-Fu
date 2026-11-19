import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Hollow try, the G1 kind: put a clamping accessor on camera.radius with its own storage. Every write,
// the library's wheel and pinch code included, is clamped, and every read gives the clamped value. The
// camera's own radius setter is never called, so its world matrix is never marked dirty: it never zooms.
export function attachLimitedOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext, minDistance: number, maxDistance: number): () => void {
    const clamp = (v: number): number => Math.min(maxDistance, Math.max(minDistance, v));
    const own = Object.getOwnPropertyDescriptor(camera, "radius");
    let radius = clamp(camera.radius);
    Object.defineProperty(camera, "radius", {
        get: () => radius,
        set: (v: number) => {
            radius = clamp(v);
        },
        configurable: true,
        enumerable: true,
    });
    const detach = attachControl(camera, canvas, scene);
    return () => {
        detach();
        if (own) {
            Object.defineProperty(camera, "radius", own);
        }
    };
}
