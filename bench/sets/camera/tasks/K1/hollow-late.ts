import { attachControl, createArcRotateCamera, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Orbit camera at radius 10 around the origin, with the library's pointer/touch controls and its
// arrow-key module.
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(Math.PI / 2, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });
    attachControl(camera, canvas, scene, { keyboard: true });
    enableArcRotateKeyboardControls();
    return camera;
}
