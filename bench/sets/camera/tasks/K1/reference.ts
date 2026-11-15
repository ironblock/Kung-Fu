import { attachControl, createArcRotateCamera, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(Math.PI / 2, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });
    // The keyboard module is a separate opt-in: it has to be enabled once before the controls are attached.
    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });
    return camera;
}
