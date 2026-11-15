import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

/**
 * Create an orbit camera that looks at the origin from 10 units away, with the
 * library's mouse and touch controls and Arrow-key rotation on the canvas.
 *
 * `attachControl` registers its inertia hook on `scene`, so keyboard and pointer
 * input only move the camera while that scene renders.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // Keyboard input is opt-in and process-global. It must be installed before
    // attachControl is given `keyboard`, or the option is silently ignored.
    enableArcRotateKeyboardControls();

    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });
    attachControl(camera, canvas, scene, { keyboard: true });
    return camera;
}
