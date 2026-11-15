import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Create an orbit camera that looks at the origin from 10 units away, with the
 * library's default mouse/touch controls and its Arrow-key keyboard controls
 * attached to `canvas`.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });

    // Keyboard input is an opt-in module; it must be installed before
    // `keyboard` is passed to attachControl, or that option does nothing.
    enableArcRotateKeyboardControls();

    // Keyboard events only reach a canvas that can take focus.
    if (!canvas.hasAttribute("tabindex")) {
        canvas.tabIndex = 0;
    }

    // Passing the scene enables inertia. The returned detach function is not
    // kept here: the canvas listeners stay until the page goes away.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
