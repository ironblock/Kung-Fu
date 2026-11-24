import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's default mouse/touch controls and arrow-key rotation on the canvas.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(0, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });

    // attachControl ignores `keyboard: true` unless this has run first.
    enableArcRotateKeyboardControls();

    // The scene is required: without it the camera never moves from drag/wheel/key input.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
