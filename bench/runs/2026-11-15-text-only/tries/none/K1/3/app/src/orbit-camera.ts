import { ArcRotateCamera, Vector3, type SceneContext } from "@babylonjs/lite";

/**
 * Creates an orbit camera that looks at the origin from 10 units away,
 * with mouse/touch controls on the canvas and arrow-key control enabled.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = new ArcRotateCamera(
        "orbitCamera",
        -Math.PI / 2,
        Math.PI / 2,
        10,
        Vector3.Zero(),
        scene,
    );

    // Keyboard events are only delivered to a focusable element.
    if (!canvas.hasAttribute("tabindex")) {
        canvas.tabIndex = 0;
    }

    // Library's standard mouse and touch controls.
    camera.attachControl(canvas, true);

    // Library's arrow-key control for rotating the camera.
    camera.inputs.addKeyboard();

    return camera;
}
