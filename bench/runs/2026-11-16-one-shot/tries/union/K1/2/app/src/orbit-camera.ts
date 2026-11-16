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
    const target = { x: 0, y: 0, z: 0 };
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 3, ORBIT_RADIUS, target);

    // keyboard: true is ignored until this has run once.
    if (!keyboardControlsEnabled) {
        enableArcRotateKeyboardControls();
        keyboardControlsEnabled = true;
    }

    // The scene must be passed, or drags and the wheel do not move the camera.
    attachControl(camera, canvas, scene, {
        pointerMappings: { primaryButton: "rotate", secondaryButton: "pan" },
        keyboard: true,
    });

    return camera;
}
