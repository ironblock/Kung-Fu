import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse and touch controls and arrow-key control on the canvas.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 3, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // Keyboard controls must be enabled before attachControl is called with keyboard on.
    enableArcRotateKeyboardControls();

    // attachControl returns a dispose function; it is not kept here because the
    // required return value is the camera.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
