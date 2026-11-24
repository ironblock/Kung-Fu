import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse/touch controls and arrow-key control attached to `canvas`.
 *
 * The camera is returned but not assigned to `scene`; the caller decides how
 * it is used. The control listeners stay attached to the canvas until the
 * caller detaches them, which this function does not expose.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // Arrow-key control is opt-in and must be installed before attachControl
    // is asked to use the `keyboard` option. Calling it again is a no-op.
    enableArcRotateKeyboardControls();

    // alpha = -PI/2, beta = PI/2 places the camera on the -Z axis at elevation 0.
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
