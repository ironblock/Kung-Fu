import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    onSceneDispose,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

/**
 * Creates an orbit camera looking at the origin from 10 units away, with the
 * library's mouse/touch controls and arrow-key controls attached to `canvas`.
 *
 * The controls are tied to `scene` via `onSceneDispose`, so disposing the scene
 * also removes the canvas listeners.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // Keyboard controls are opt-in and must be installed before attachControl
    // is asked for them. Idempotent, so calling it here is safe.
    enableArcRotateKeyboardControls();

    onSceneDispose(
        scene,
        attachControl(camera, canvas, scene, {
            keyboard: true,
        }),
    );

    return camera;
}
