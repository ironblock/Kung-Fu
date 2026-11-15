import {
    addToScene,
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    onSceneDispose,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/** Distance from the camera to the origin. */
const ORBIT_RADIUS = 10;

/**
 * Creates an orbit camera looking at the origin from 10 units away, wires up the
 * library's mouse and touch controls on `canvas`, and enables arrow-key control.
 * The camera becomes the active camera of `scene`. The controls are detached
 * automatically when the scene is disposed.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // Babylon default pose: alpha = -PI/2, beta = PI/2 puts the eye on the -Z axis.
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    addToScene(scene, camera);

    // Keyboard input is opt-in. The enabler is process-global and idempotent.
    enableArcRotateKeyboardControls();
    onSceneDispose(scene, attachControl(camera, canvas, scene, { keyboard: true }));

    return camera;
}
