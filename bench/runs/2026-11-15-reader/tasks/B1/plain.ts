import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachLimitedOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext, minDistance: number, maxDistance: number): () => void {
    camera.lowerRadiusLimit = minDistance;
    camera.upperRadiusLimit = maxDistance;
    return attachControl(camera, canvas, scene);
}
