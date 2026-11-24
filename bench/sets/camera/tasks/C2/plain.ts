import { attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// As in Babylon.js, whose ArcRotateCamera pointer input has useCtrlForPanning = true by default,
// Ctrl + primary drag already pans with the standard controls.
export function attachOrbitWithCtrlPan(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachControl(camera, canvas, scene);
}
