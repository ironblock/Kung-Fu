import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // The keyboard option is a no-op until the library's arrow-key controls are installed.
    enableArcRotateKeyboardControls();

    const camera = createArcRotateCamera(
        -Math.PI / 2,
        Math.PI / 2.5,
        ORBIT_RADIUS,
        { x: 0, y: 0, z: 0 },
    );

    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
