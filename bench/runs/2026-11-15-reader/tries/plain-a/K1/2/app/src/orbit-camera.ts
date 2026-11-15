import { attachControl, createArcRotateCamera, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Creates an orbit camera looking at the origin from 10 units away, wired to
 * the library's mouse/touch controls and arrow-key controls on the canvas.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });

    // Arrow-key control is an opt-in module; install it before attaching with keyboard enabled.
    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
