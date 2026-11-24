import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse and touch controls attached to `canvas` and arrow-key
 * control turned on.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(0, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });

    // Arrow-key control must be enabled before attachControl is called,
    // and attachControl must be given keyboard: true to use it.
    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
