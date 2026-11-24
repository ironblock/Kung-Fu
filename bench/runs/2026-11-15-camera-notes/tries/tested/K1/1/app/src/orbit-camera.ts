import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse and touch controls on `canvas` and arrow-key control enabled.
 *
 * The detach function returned by attachControl is not returned here; the
 * controls stay attached for the lifetime of the canvas.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(0, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });

    // attachControl ignores its `keyboard` option until this has been called.
    enableArcRotateKeyboardControls();

    // The scene argument is required: without it the drag and wheel input never moves the camera.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
