import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's default mouse and touch controls and arrow-key control enabled.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // The library ignores the `keyboard` option until this has been called.
    enableArcRotateKeyboardControls();

    // Passing the scene lets drags and wheel move the camera; without it they do nothing.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
