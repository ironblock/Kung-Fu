import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse and touch controls and its arrow-key control on the canvas.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(0, Math.PI / 3, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // attachControl ignores keyboard: true unless this has run first.
    enableArcRotateKeyboardControls();

    // The scene is passed so the input is applied each frame; without it the camera never moves.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
