import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

/**
 * Creates an orbit camera looking at the origin from ORBIT_RADIUS units away,
 * with the library's mouse and touch controls and arrow-key control on the canvas.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(
        -Math.PI / 2,
        Math.PI / 2,
        ORBIT_RADIUS,
        { x: 0, y: 0, z: 0 },
    );

    // attachControl ignores keyboard: true unless this has run first.
    enableArcRotateKeyboardControls();

    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
