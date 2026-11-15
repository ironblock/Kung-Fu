import {
    Vector3,
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

// Keyboard support is process-global and must be installed before attachControl
// samples it (see camera-ledger.toml, "arc keyboard: what it means").
let arcKeyboardInstalled = false;

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    if (!arcKeyboardInstalled) {
        enableArcRotateKeyboardControls();
        arcKeyboardInstalled = true;
    }

    // Keys are only heard while the canvas has focus. Give it a focusable tabIndex
    // if it has none, so arrow keys work after a click.
    if (!canvas.hasAttribute("tabindex")) {
        canvas.tabIndex = 0;
    }

    // Assumed positional signature: (name, alpha, beta, radius, target). Not verified.
    const camera = createArcRotateCamera(
        "orbit",
        -Math.PI / 2,
        Math.PI / 3,
        10,
        new Vector3(0, 0, 0),
    );

    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
