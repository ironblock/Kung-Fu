import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse/touch controls and its arrow-key control attached to `canvas`.
 *
 * Order matters for the keyboard: attachControl reads the installed keyboard
 * factory once, at the moment it is called, so enableArcRotateKeyboardControls
 * must run first, and attachControl must be given `keyboard: true`. Getting
 * either wrong fails silently (the arrow keys just do nothing).
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera("orbitCamera", -Math.PI / 2, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });

    // Process-global and idempotent in intent; must happen before attachControl.
    enableArcRotateKeyboardControls();

    // Arrow keys are only heard while the canvas has focus. The library sets
    // tabIndex 0 if the canvas has none, but make it explicit so it is focusable.
    if (canvas.tabIndex < 0) {
        canvas.tabIndex = 0;
    }

    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
