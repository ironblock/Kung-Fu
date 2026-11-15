import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // Make the library's arrow-key control available before attaching it.
    enableArcRotateKeyboardControls();

    // Default pointer mappings (mouse and touch), plus keyboard arrow-key rotation.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
