import { attachControl, createArcRotateCamera, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

/**
 * Create an orbit camera looking at the origin from ORBIT_RADIUS units away,
 * with the library's mouse/touch controls and arrow-key rotation attached to `canvas`.
 *
 * alpha = -PI/2, beta = PI/2 places the eye on the +Z axis, looking back at the origin.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // Keyboard support is opt-in: install the seam once, then request it per attachment.
    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
