import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(
        -Math.PI / 2,
        Math.PI / 2,
        ORBIT_RADIUS,
        { x: 0, y: 0, z: 0 },
    );

    // The keyboard option is only honored once the keyboard controls are installed.
    enableArcRotateKeyboardControls();

    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
