import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Snappier drags: halve the drag sensibilities (lower = faster). The wheel keeps its own precision.
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    camera.angularSensibility /= 2;
    camera.panningSensibility /= 2;
    return attachControl(camera, canvas, scene);
}
