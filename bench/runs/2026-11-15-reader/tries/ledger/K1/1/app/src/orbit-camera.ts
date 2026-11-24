import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    onSceneDispose,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse and touch controls and arrow-key rotation on the canvas.
 *
 * The control listeners are removed when the scene is disposed.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // alpha 0, beta pi/2 puts the eye on the +X axis at the level of the origin.
    const camera = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });

    // Arrow-key input is opt-in and process-global. It must be installed before
    // attachControl is called with `keyboard`.
    enableArcRotateKeyboardControls();

    // The scene argument is required: without it, neither the mouse/touch
    // inertia nor the arrow-key input is ever applied.
    const detach = attachControl(camera, canvas, scene, { keyboard: true });
    onSceneDispose(scene, detach);

    return camera;
}
