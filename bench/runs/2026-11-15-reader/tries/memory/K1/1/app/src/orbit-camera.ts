import { ArcRotateCamera, Vector3 } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

/**
 * Creates an orbit camera that looks at the origin from 10 units away.
 * Mouse and touch controls are attached to the canvas, and the library's
 * arrow-key control is enabled so the camera can be turned from the keyboard.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = new ArcRotateCamera(
        "orbitCamera",
        -Math.PI / 2,
        Math.PI / 2.5,
        10,
        Vector3.Zero(),
        scene,
    );

    camera.inputs.addKeyboard();
    camera.attachControl(canvas, true);

    return camera;
}
