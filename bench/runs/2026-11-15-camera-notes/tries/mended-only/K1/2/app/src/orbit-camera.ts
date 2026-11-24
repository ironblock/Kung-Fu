import {
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    Vector3,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse/touch controls on the canvas and arrow-key rotation enabled.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(
        "orbitCamera",
        0,                       // alpha
        Math.PI / 2,             // beta: level with the XZ plane
        10,                      // radius
        new Vector3(0, 0, 0),    // target: the origin
        scene,
    );

    // Arrow-key control must be enabled before attachControl, with keyboard on.
    enableArcRotateKeyboardControls();
    camera.attachControl(canvas, { keyboard: true });

    return camera;
}
