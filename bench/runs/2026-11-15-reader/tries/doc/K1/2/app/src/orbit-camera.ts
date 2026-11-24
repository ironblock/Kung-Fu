import { attachControl, createArcRotateCamera, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Create an orbit camera at radius 10 looking at the origin, with the library's
 * mouse, touch and wheel controls plus Arrow-key rotation on the given canvas.
 *
 * `scene` must already exist; its render loop drives the camera's inertia.
 * The returned camera is the only handle: the library's detach function is not
 * returned, so the canvas listeners stay attached for the lifetime of the page.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // Start on the +Z axis at distance 10 (alpha = -PI/2, beta = PI/2), target the origin.
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });

    // Keyboard support is an opt-in seam; it must be installed before attachControl sees `keyboard`.
    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
