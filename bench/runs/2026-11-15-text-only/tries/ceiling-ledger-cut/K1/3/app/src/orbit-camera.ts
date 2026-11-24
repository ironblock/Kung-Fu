import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse/touch controls and its arrow-key control attached to `canvas`.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // Keyboard support is opt-in: attachControl only calls the keyboard factory
    // if one has been installed, and skips it silently otherwise. Install it
    // before attaching, since a camera attached earlier does not pick it up.
    enableArcRotateKeyboardControls();

    // alpha, beta, radius, target
    const camera = createArcRotateCamera("orbit", -Math.PI / 2, Math.PI / 3, 10, { x: 0, y: 0, z: 0 }, scene);

    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
