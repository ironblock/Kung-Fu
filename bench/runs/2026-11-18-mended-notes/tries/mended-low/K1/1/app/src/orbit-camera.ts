import { createArcRotateCamera, attachControl, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    enableArcRotateKeyboardControls();
    const camera = createArcRotateCamera(0, Math.PI / 4, 10, { x: 0, y: 0, z: 0 });
    attachControl(camera, canvas, scene, { keyboard: true });
    return camera;
}
