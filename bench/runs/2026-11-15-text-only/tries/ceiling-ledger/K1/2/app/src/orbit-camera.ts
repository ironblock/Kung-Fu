import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

let keyboardEnabled = false;

/**
 * Creates an orbit (arc-rotate) camera looking at the origin from 10 units away, with the
 * library's mouse/touch controls and its arrow-key control attached to `canvas`.
 *
 * Order matters for the keyboard: attachControl reads the installed keyboard factory once, when
 * it is called, so enableArcRotateKeyboardControls() must run first, and attachControl must be
 * given `keyboard: true`. Getting either wrong fails silently (the arrow keys just do nothing).
 * The keys are heard only while the canvas has focus.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });

    // Process-global and meant to run once, so guard it here.
    if (!keyboardEnabled) {
        enableArcRotateKeyboardControls();
        keyboardEnabled = true;
    }

    // Pass the scene: without it the input is collected but never applied to the camera.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
