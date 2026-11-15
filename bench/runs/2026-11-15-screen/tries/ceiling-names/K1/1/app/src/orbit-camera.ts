import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

/**
 * Creates an orbit (arc-rotate) camera that looks at the origin from 10 units
 * away, with the library's default mouse/touch controls and its arrow-key
 * keyboard control attached to `canvas`.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // alpha: rotation around the vertical axis; beta: angle from the vertical axis.
    // These values put the camera in front of the origin and a bit above it.
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });

    // Keyboard support is opt-in: attachControl only sets up key handling
    // after the keyboard module has been installed, so this call has to come
    // before attachControl. Otherwise `keyboard: true` does nothing.
    enableArcRotateKeyboardControls();

    // A canvas only gets key events when it can take focus.
    if (!canvas.hasAttribute("tabindex")) {
        canvas.tabIndex = 0;
    }

    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
