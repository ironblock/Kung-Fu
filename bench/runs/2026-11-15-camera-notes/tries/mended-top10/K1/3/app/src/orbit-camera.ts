import {
    createArcRotateCamera,
    attachControl,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;
const ORBIT_ALPHA = -Math.PI / 2;
const ORBIT_BETA = Math.PI / 2.5;

/**
 * Creates an orbit camera that looks at the origin from 10 units away, with the
 * library's mouse and touch controls and arrow-key control attached to `canvas`.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(
        ORBIT_ALPHA,
        ORBIT_BETA,
        ORBIT_RADIUS,
        { x: 0, y: 0, z: 0 },
    );

    // attachControl ignores `keyboard: true` unless this has run first.
    enableArcRotateKeyboardControls();

    // The scene argument is required: drag, wheel and keys only accumulate
    // inertial offsets, which are applied to the camera in scene._beforeRender.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
