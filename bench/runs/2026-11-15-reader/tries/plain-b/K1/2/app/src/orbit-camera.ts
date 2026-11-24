import {
    addToScene,
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/** Distance from the orbit target (the origin) to the camera. */
const ORBIT_RADIUS = 10;

/**
 * Create an orbit camera that looks at the origin from 10 units away, wire up
 * the library's mouse and touch controls on `canvas`, and enable arrow-key
 * orbiting. The camera is added to `scene`, which makes it the active camera.
 *
 * The control listeners stay attached to `canvas` for its lifetime. This
 * function returns only the camera, so it does not expose the detach function
 * that `attachControl` returns.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // Horizontal view, positioned on the -Z side of the origin.
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    addToScene(scene, camera);

    // Keyboard support is an opt-in module and must be installed before
    // attachControl is asked for `keyboard`. Arrow keys are the default mapping.
    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
