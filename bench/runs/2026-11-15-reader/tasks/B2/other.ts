import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Another right answer: read the library's default from a fresh camera and halve it after attaching.
export function attachFastOrbit(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detach = attachControl(camera, canvas, scene);
    const libraryDefault = createArcRotateCamera(0, 1, 1, { x: 0, y: 0, z: 0 }).angularSensibility;
    camera.angularSensibility = libraryDefault * 0.5;
    return detach;
}
