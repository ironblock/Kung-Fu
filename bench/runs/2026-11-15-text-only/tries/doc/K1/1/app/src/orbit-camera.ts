import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

/**
 * Creates an orbit camera looking at the origin from ORBIT_RADIUS units away,
 * with the library's mouse and touch controls and arrow-key rotation on the canvas.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // alpha = -PI/2, beta = PI/2 places the eye on the +Z axis, looking at the origin.
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // Keyboard input is opt-in: install the seam once, then request Arrow-key control.
    enableArcRotateKeyboardControls();

    // Keyboard events need a focusable canvas. Leave an existing tabindex alone.
    if (!canvas.hasAttribute("tabindex")) {
        canvas.tabIndex = 0;
    }

    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
