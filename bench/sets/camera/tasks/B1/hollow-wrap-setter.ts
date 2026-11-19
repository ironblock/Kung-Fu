import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Clamp in the radius setter itself: wrap the camera's own accessor, so every write is kept in range.
export function attachLimitedOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext, minDistance: number, maxDistance: number): () => void {
    const own = Object.getOwnPropertyDescriptor(camera, "radius")!;
    Object.defineProperty(camera, "radius", {
        configurable: true,
        enumerable: true,
        get: () => own.get!.call(camera),
        set: (v: number) => own.set!.call(camera, Math.min(maxDistance, Math.max(minDistance, v))),
    });
    camera.radius = own.get!.call(camera);
    const detach = attachControl(camera, canvas, scene);
    return () => {
        detach();
        Object.defineProperty(camera, "radius", own);
    };
}
