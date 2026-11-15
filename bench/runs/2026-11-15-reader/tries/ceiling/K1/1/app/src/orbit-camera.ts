import { attachControl, createArcRotateCamera, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Create an orbit camera that looks at the origin from 10 units away, make it
 * the scene's active camera, and attach mouse, touch and arrow-key controls to
 * the canvas.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2.5, 10, { x: 0, y: 0, z: 0 });
    scene.camera = camera;

    // Keyboard support is opt-in: it must be installed before attachControl
    // is called with `keyboard`, otherwise the option is silently ignored.
    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
