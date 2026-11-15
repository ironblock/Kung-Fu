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
 * library's mouse and touch controls and arrow-key control enabled on `canvas`.
 *
 * The camera becomes the scene's active camera. The canvas listeners are tied to
 * the scene's lifetime, so `disposeScene(scene)` detaches them.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // Arrow-key control is an opt-in module and must be installed before attachControl runs with `keyboard`.
    enableArcRotateKeyboardControls();

    // Alpha and beta are initial angles: beta = PI/2 puts the eye level with the origin.
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, vec3(0, 0, 0));
    scene.camera = camera;

    // attachControl returns a cleanup function, which is registered so that disposing the scene removes the canvas listeners.
    onSceneDispose(scene, attachControl(camera, canvas, scene, { keyboard: true }));

    return camera;
}
