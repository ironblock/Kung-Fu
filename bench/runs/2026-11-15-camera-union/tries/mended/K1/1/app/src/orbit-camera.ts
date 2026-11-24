import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse and touch controls and arrow-key control attached to `canvas`.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });

    // attachControl ignores its `keyboard` option unless this was called first.
    enableArcRotateKeyboardControls();

    // The returned detach function is not kept; the signature of this module
    // returns only the camera.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
