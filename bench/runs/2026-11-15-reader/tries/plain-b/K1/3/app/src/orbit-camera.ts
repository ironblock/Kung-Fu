import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/** Distance from the orbit target (the origin) to the camera. */
const ORBIT_RADIUS = 10;

/**
 * Create an ArcRotateCamera orbiting the origin from 10 units away, with the
 * library's mouse/touch controls and arrow-key controls attached to `canvas`.
 *
 * The camera is returned but not made active on `scene`; `scene` is only used
 * for the per-frame inertia hook.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // Keyboard support is opt-in and process-global; install it before attaching.
    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
