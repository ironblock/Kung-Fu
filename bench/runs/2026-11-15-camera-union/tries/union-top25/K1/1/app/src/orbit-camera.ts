import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

let keyboardControlsEnabled = false;

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse and touch controls and arrow-key rotation attached to `canvas`.
 *
 * `scene` must be the scene already created by the app; the controls need it
 * to apply their per-frame motion.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });

    // The library ignores `keyboard: true` unless this has run first.
    if (!keyboardControlsEnabled) {
        enableArcRotateKeyboardControls();
        keyboardControlsEnabled = true;
    }

    // The returned detach function is not kept here; see the note in the reply.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
