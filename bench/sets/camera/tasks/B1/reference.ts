import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachLimitedOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext, minDistance: number, maxDistance: number): () => void {
    const removeLimits = setCameraLimits(camera, { lowerRadiusLimit: minDistance, upperRadiusLimit: maxDistance });
    const detach = attachControl(camera, canvas, scene);
    return () => {
        detach();
        removeLimits();
    };
}
