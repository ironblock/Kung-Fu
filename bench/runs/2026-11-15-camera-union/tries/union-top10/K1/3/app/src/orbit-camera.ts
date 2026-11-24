import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // Looking at the origin from 10 units away.
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });

    // attachControl ignores keyboard: true unless this has run first.
    enableArcRotateKeyboardControls();

    // Passing the scene makes mouse and touch drags move the camera directly.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
