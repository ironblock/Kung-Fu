import { createArcRotateCamera, type ArcRotateCamera } from "@babylonjs/lite/camera/arc-rotate.js";
import { attachControl } from "@babylonjs/lite/camera/arc-rotate-controls.js";
import { enableArcRotateKeyboardControls } from "@babylonjs/lite/camera/arc-rotate-keyboard-controls.js";
import type { SceneContext } from "@babylonjs/lite/scene/scene.js";

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });
    return camera;
}
