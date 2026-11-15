import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

/**
 * Creates an arc-rotate (orbit) camera looking at the origin from 10 units away,
 * with the library's mouse/touch controls and arrow-key rotation enabled on `canvas`.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(
        Math.PI / 2,
        Math.PI / 3,
        ORBIT_RADIUS,
        { x: 0, y: 0, z: 0 },
    );

    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
