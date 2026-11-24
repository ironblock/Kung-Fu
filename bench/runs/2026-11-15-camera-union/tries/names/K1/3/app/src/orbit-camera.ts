import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

let keyboardControlsEnabled = false;

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // Registers the library's arrow-key handling. Done once so repeated calls don't re-register it.
    if (!keyboardControlsEnabled) {
        enableArcRotateKeyboardControls();
        keyboardControlsEnabled = true;
    }

    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // Mouse and touch via the library's default pointer mappings; keyboard turns the camera with the arrow keys.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
