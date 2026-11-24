import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    onSceneDispose,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Arrow-key control is an opt-in: attachControl only builds the keyboard
// handler if enableArcRotateKeyboardControls() has installed its factory
// first. Without this call, { keyboard: true } is silently ignored.
// Calling it more than once is harmless (it only fills the factory slot).
let keyboardEnabled = false;
function ensureKeyboardControls(): void {
    if (!keyboardEnabled) {
        enableArcRotateKeyboardControls();
        keyboardEnabled = true;
    }
}

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    ensureKeyboardControls();

    // Looks at the origin from 10 units away.
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });

    // Mouse, touch and arrow keys. The scene argument is required: without it
    // the controls collect input but never apply it.
    const detach = attachControl(camera, canvas, scene, { keyboard: true });

    // disposeScene drops the per-frame hook but not the canvas listeners,
    // so remove those ourselves when the scene goes away.
    onSceneDispose(scene, detach);

    return camera;
}
