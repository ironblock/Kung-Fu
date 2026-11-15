import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an orbit camera that looks at the origin from 10 units away, with
 * mouse/touch controls and arrow-key rotation attached to the canvas.
 *
 * The camera starts at (0, 0, 10) looking at (0, 0, 0): alpha = π/2 and
 * beta = π/2 place it on the +Z axis.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });

    // Keyboard controls are opt-in and must be installed before attachControl
    // is asked to use them. The call is idempotent.
    enableArcRotateKeyboardControls();

    // Default mouse/touch handling, plus Arrow-key rotation via `keyboard: true`.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
