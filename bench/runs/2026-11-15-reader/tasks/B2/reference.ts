import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // The sensibility divides the drag distance: a lower value turns the camera further.
    camera.angularSensibility /= 2;
    return attachControl(camera, canvas, scene);
}
