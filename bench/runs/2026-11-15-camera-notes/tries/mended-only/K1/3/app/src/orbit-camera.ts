import {
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    Vector3,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const RADIUS = 10;

/**
 * Creates an orbit camera looking at the origin from RADIUS units away, with
 * the library's mouse and touch controls on the canvas and arrow-key control.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(
        "orbit",
        0,
        Math.PI / 2,
        RADIUS,
        new Vector3(0, 0, 0),
        scene,
    );

    // Keyboard input is ignored by attachControl unless this has run first.
    enableArcRotateKeyboardControls();

    // Without the scene, the camera's per-frame update never runs and it does not move.
    camera.attachControl(canvas, scene, { keyboard: true });

    return camera;
}
