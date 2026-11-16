import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext, Vec3 } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

/**
 * Creates an orbit camera that looks at the origin from 10 units away, with the
 * library's default mouse/touch controls and arrow-key control enabled.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const target: Vec3 = { x: 0, y: 0, z: 0 };
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, target);

    // Make sure the library's arrow-key implementation is registered before attaching.
    enableArcRotateKeyboardControls();

    // Mouse and touch controls (library defaults), plus the library's keyboard control.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
