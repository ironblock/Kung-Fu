import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/**
 * Create an orbit camera looking at the origin from 10 units away, with the
 * library's default mouse/touch controls and its opt-in Arrow-key controls
 * attached to `canvas`.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // alpha = -PI/2, beta = PI/2 puts the camera on the +Z axis looking at the target.
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });

    // Keyboard support is a separate opt-in seam; it must be installed before
    // attaching a keyboard-enabled camera. The call is idempotent.
    enableArcRotateKeyboardControls();

    // Keyboard events only reach the canvas when it can take focus.
    if (!canvas.hasAttribute("tabindex")) {
        canvas.tabIndex = 0;
    }

    // Passing the scene registers inertia on the scene's render loop.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
