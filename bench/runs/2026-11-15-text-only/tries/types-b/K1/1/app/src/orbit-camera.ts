import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;
const ORBIT_ALPHA = -Math.PI / 2;
const ORBIT_BETA = Math.PI / 2.5;

/**
 * Creates an orbit camera that looks at the origin from 10 units away, wires up
 * the library's mouse and touch controls on the canvas, and enables the
 * library's Arrow-key controls so the camera can be turned from the keyboard.
 *
 * The controls' canvas listeners stay attached for the canvas's lifetime. The
 * detach function returned by attachControl is discarded because this function
 * only returns the camera, so callers have no way to remove them.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(ORBIT_ALPHA, ORBIT_BETA, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // Keyboard support is an opt-in module; it must be installed before
    // attachControl is given `keyboard`. Calling it again is a no-op.
    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
