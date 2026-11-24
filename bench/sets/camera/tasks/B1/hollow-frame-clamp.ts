import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachLimitedOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext, minDistance: number, maxDistance: number): () => void {
    const clamp = (): void => {
        if (camera.radius < minDistance) camera.radius = minDistance;
        else if (camera.radius > maxDistance) camera.radius = maxDistance;
    };
    clamp();
    const detach = attachControl(camera, canvas, scene);
    // Clamp after the controls have applied this frame's zoom, before the frame is drawn.
    const perFrame = (): void => clamp();
    scene._beforeRender.push(perFrame);
    return () => {
        detach();
        const at = scene._beforeRender.indexOf(perFrame);
        if (at >= 0) scene._beforeRender.splice(at, 1);
    };
}
