import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// enableArcRotateKeyboardControls() is process-global and only needs to run once.
// It must run before attachControl(), which samples the installed keyboard factory
// at the moment it is called; otherwise the arrow keys silently do nothing.
let arrowKeysInstalled = false;

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    if (!arrowKeysInstalled) {
        enableArcRotateKeyboardControls();
        arrowKeysInstalled = true;
    }

    // Keyboard input is only heard while the canvas has focus.
    if (!canvas.hasAttribute("tabindex")) {
        canvas.tabIndex = 0;
    }

    const camera = createArcRotateCamera({
        alpha: -Math.PI / 2,
        beta: Math.PI / 2,
        radius: 10,
        target: { x: 0, y: 0, z: 0 },
    });

    // Pass the scene so the controls are applied each frame, and enable the arrow keys.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
