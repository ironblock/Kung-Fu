import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/** Distance from the camera to the origin, in scene units. */
const ORBIT_RADIUS = 10;

/**
 * Create an orbit camera that looks at the origin from 10 units away, with the
 * library's mouse and touch controls and arrow-key controls on the canvas.
 *
 * The camera is plain data; the returned controls are attached to `canvas` and
 * `scene`. Callers that want the controls removed should register the detach
 * function themselves; it is not tracked here.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // Alpha/beta chosen so the camera sits on the -Z axis, 10 units from the origin.
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // Keyboard support is an opt-in module. It must be installed before
    // attachControl is given `keyboard`, otherwise the option is ignored.
    enableArcRotateKeyboardControls();

    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
