import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

/**
 * Creates an orbit camera looking at the origin from 10 units away, wired to
 * the library's mouse and touch controls plus the opt-in Arrow-key controls.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // alpha = -PI/2, beta = PI/2 places the camera on the +Z axis looking at the target.
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // Keyboard support is an opt-in seam; it must be installed before keyboard: true takes effect.
    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
