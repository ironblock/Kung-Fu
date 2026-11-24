import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's standard mouse/touch controls and arrow-key rotation enabled.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(
        -Math.PI / 2, // alpha: horizontal angle
        Math.PI / 2.5, // beta: angle from the vertical axis
        10, // radius: distance from target
        { x: 0, y: 0, z: 0 }, // target: origin
    );

    // Arrow-key control must be installed before keyboard is requested in attachControl.
    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
