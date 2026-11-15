import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    onSceneDispose,
    Vector3,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// The keyboard factory is process-wide and must be installed once, before
// attachControl is called with { keyboard: true }. Track that here so repeated
// calls to createOrbitCamera do not reinstall it.
let arcRotateKeyboardInstalled = false;

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera("orbit", -Math.PI / 2, Math.PI / 3, 10, new Vector3(0, 0, 0), scene);

    if (!arcRotateKeyboardInstalled) {
        enableArcRotateKeyboardControls();
        arcRotateKeyboardInstalled = true;
    }

    // The canvas listeners are not tied to the scene, so release them when the scene is disposed.
    const detach = attachControl(camera, canvas, { keyboard: true }, scene);
    onSceneDispose(scene, detach);

    return camera;
}
