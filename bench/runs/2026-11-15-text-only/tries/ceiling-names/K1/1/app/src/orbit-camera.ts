import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Creates an orbit (arc-rotate) camera looking at the origin from 10 units away,
 * with the library's default mouse/touch controls and arrow-key controls attached.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });

    // Keyboard support is opt-in: the `keyboard` option of attachControl only
    // takes effect once the keyboard controls module has been installed.
    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
