import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    onSceneDispose,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/**
 * Create an orbit camera looking at the origin from 10 units away, with the
 * library's mouse and touch controls and arrow-key control on the canvas.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(Math.PI / 2, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });

    // The keyboard factory must be installed before attachControl runs. It is
    // sampled at attach time, so enabling it afterwards has no effect on this camera.
    enableArcRotateKeyboardControls();
    const detach = attachControl(camera, canvas, scene, { keyboard: true });

    // Remove the canvas listeners when the scene is disposed.
    onSceneDispose(scene, detach);

    return camera;
}
