import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's default mouse/touch controls and arrow-key rotation enabled.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(
        -Math.PI / 2,
        Math.PI / 3,
        ORBIT_RADIUS,
        { x: 0, y: 0, z: 0 },
    );

    // Keyboard support is provided by a separate module; it must be enabled
    // before attachControl can honour `keyboard: true`.
    enableArcRotateKeyboardControls();

    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
