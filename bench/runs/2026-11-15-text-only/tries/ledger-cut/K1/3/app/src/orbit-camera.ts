import { ArcRotateCamera, Vector3, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

// The library's arrow-key control is opt-in: attachControl ignores
// { keyboard: true } until enableArcRotateKeyboardControls() has run once in
// the process. Call it once, before the first attachControl.
let arcRotateKeyboardEnabled = false;

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    if (!arcRotateKeyboardEnabled) {
        enableArcRotateKeyboardControls();
        arcRotateKeyboardEnabled = true;
    }

    const camera = new ArcRotateCamera(
        "orbit",
        -Math.PI / 2,
        Math.PI / 2.5,
        ORBIT_RADIUS,
        new Vector3(0, 0, 0),
        scene,
    );

    // Mouse and touch from the library's usual pointer controls, plus arrow keys.
    camera.attachControl(canvas, { keyboard: true });

    return camera;
}
