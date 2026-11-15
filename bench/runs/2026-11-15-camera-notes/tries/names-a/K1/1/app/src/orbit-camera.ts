import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // Camera sits 10 units from the origin, looking at (0, 0, 0).
    // alpha = -PI/2, beta = PI/2 places it on the -Z axis at the horizon.
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // Arrow-key orbiting uses the library's keyboard controls, which must be enabled first.
    enableArcRotateKeyboardControls();

    // Mouse and touch via the library's default pointer mappings, plus its keyboard controls.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
