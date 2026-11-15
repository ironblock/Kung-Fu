import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/** Distance from the camera to the origin. */
const ORBIT_RADIUS = 10;

/**
 * Create an orbit camera that looks at the origin from 10 units away, with the
 * library's mouse/touch controls and arrow-key controls attached to `canvas`.
 *
 * The camera is not made active on `scene`; the caller decides that.
 * The controls' listeners stay attached to `canvas` until the caller detaches
 * them, which this function does not expose.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // Keyboard support is an opt-in module; it must be installed before
    // attachControl is given `keyboard`. Calling it again is a no-op.
    enableArcRotateKeyboardControls();

    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
