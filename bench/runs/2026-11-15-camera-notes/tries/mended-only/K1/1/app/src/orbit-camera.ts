import {
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

/**
 * Creates an orbit camera that looks at the origin from 10 units away, with the
 * library's mouse and touch controls on the canvas and arrow-key rotation enabled.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera("orbit", -Math.PI / 2, Math.PI / 3, ORBIT_RADIUS, scene);

    // Edit the target in place: assigning a new object does not mark the view matrix dirty.
    camera.target.x = 0;
    camera.target.y = 0;
    camera.target.z = 0;
    camera.radius = ORBIT_RADIUS;

    // The keyboard option of attachControl is ignored unless this is called first.
    // A canvas without a tabindex attribute gets tabIndex 0 so it can receive keys.
    enableArcRotateKeyboardControls();
    camera.attachControl(canvas, { scene, keyboard: true });

    return camera;
}
