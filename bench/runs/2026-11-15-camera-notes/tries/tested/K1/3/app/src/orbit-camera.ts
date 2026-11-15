import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an arc-rotate (orbit) camera looking at the origin from 10 units
 * away, with the library's mouse and touch controls and arrow-key rotation
 * attached to the canvas.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });

    // The keyboard option does nothing until the keyboard controls are enabled,
    // so this must run before attachControl.
    enableArcRotateKeyboardControls();

    // The scene argument is required: without it the camera never moves.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
