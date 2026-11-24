import { ArcRotateCamera, Vector3 } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

/**
 * Creates an orbit camera looking at the origin from 10 units away.
 * Mouse and touch controls are attached to the canvas, and the library's
 * arrow-key input is enabled so the camera can also be turned from the keyboard.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = new ArcRotateCamera(
        "orbitCamera",
        -Math.PI / 2,      // alpha: horizontal angle
        Math.PI / 2.5,     // beta: vertical angle from the +Y axis
        10,                // radius: distance from target
        Vector3.Zero(),    // target: the origin
        scene
    );

    camera.inputs.addKeyboard();
    camera.attachControl(canvas, true);

    return camera;
}
