import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    onSceneDispose,
    vec3,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

/**
 * Create an orbit camera looking at the origin from 10 units away, with the
 * library's mouse and touch controls and arrow-key control on the canvas.
 *
 * The keyboard opt-in is process-global and must be installed before
 * `attachControl` is called with `keyboard`; `enableArcRotateKeyboardControls`
 * is idempotent, so calling it here is safe. The controls are detached when the
 * scene is disposed.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // Babylon defaults: alpha = -PI/2, beta = PI/2 (camera on the -Z side, level).
    const camera = createArcRotateCamera(-(Math.PI / 2), Math.PI / 2, ORBIT_RADIUS, vec3(0, 0, 0));

    enableArcRotateKeyboardControls();
    const detach = attachControl(camera, canvas, scene, { keyboard: true });
    onSceneDispose(scene, detach);

    return camera;
}
