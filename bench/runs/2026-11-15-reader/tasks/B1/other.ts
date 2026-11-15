import { attachControl, setCameraLimits } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Another right answer: attach first, then set the limits in two calls, and keep the limits after detaching.
export function attachLimitedOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext, minDistance: number, maxDistance: number): () => void {
    const detach = attachControl(camera, canvas, scene);
    setCameraLimits(camera, { upperRadiusLimit: maxDistance }, scene);
    setCameraLimits(camera, { lowerRadiusLimit: minDistance }, scene);
    return detach;
}
