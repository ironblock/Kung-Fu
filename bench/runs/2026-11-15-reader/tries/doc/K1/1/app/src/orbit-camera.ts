import { attachControl, createArcRotateCamera, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/** Distance from the orbit target (the origin) to the camera. */
const ORBIT_RADIUS = 10;

/**
 * Create an orbit camera that looks at the origin from 10 units away, with the
 * library's mouse and touch controls and arrow-key control attached to `canvas`.
 *
 * With the library's eye formula (z = radius * sin(alpha) * sin(beta)), alpha = PI/2 and
 * beta = PI/2 place the eye at (0, 0, 10), on the +Z axis, looking back at the origin.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // Keyboard support is opt-in. Without this call, `keyboard: true` is silently ignored.
    // The call is idempotent, so repeated calls are harmless.
    enableArcRotateKeyboardControls();

    // The returned cleanup function is not exposed by this factory's signature.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
