import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    onSceneDispose,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Creates an orbit camera looking at the origin from 10 units away, with
 * mouse/touch orbit controls and arrow-key rotation on the given canvas.
 *
 * The controls are tied to the scene's lifetime: disposing `scene` removes
 * the canvas listeners that this function attaches.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2.5, 10, { x: 0, y: 0, z: 0 });

    // Keyboard support is an opt-in module; it must be installed before
    // attachControl is given `keyboard`. Idempotent, so repeated calls are safe.
    enableArcRotateKeyboardControls();

    onSceneDispose(
        scene,
        attachControl(camera, canvas, scene, { keyboard: true }),
    );

    return camera;
}
