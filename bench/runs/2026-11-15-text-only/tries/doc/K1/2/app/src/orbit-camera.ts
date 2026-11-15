import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;
// alpha = -PI/2, beta = PI/2 places the eye on the +Z axis, looking at the origin.
const ORBIT_ALPHA = -Math.PI / 2;
const ORBIT_BETA = Math.PI / 2;

/**
 * Creates an orbit camera that looks at the origin from 10 units away, with
 * the library's mouse and touch controls and arrow-key rotation enabled.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(ORBIT_ALPHA, ORBIT_BETA, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // Keyboard input is opt-in: install the seam once, then request it per attachment.
    enableArcRotateKeyboardControls();

    // Keyboard events need the canvas to be focusable; set a tab index only if none is present.
    if (!canvas.hasAttribute("tabindex")) {
        canvas.tabIndex = 0;
    }

    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
