import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    onSceneDispose,
    vec3,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/** Distance from the origin at which the orbit camera sits. */
const ORBIT_RADIUS = 10;

/**
 * Create an orbit camera that looks at the origin from 10 units away, with the
 * library's mouse and touch controls and arrow-key rotation attached to `canvas`.
 *
 * The keyboard handlers live on the canvas, so arrow keys only act while the
 * canvas has focus. The canvas is given `tabIndex = 0` if it has none.
 *
 * Input listeners are removed automatically when `scene` is disposed.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // Babylon defaults for the starting pose: alpha = -PI/2, beta = PI/2.
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, vec3(0, 0, 0));

    // Arrow-key control is an opt-in module. Installing it is idempotent.
    enableArcRotateKeyboardControls();

    const detach = attachControl(camera, canvas, scene, { keyboard: true });
    onSceneDispose(scene, detach);

    return camera;
}
