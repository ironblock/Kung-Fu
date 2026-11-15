import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

// Orbit camera looking at the origin from ORBIT_RADIUS units away, with the
// library's mouse/touch controls and arrow-key rotation on the canvas.
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // Keyboard support must be enabled before attachControl runs, and
    // attachControl needs `keyboard` set for the arrow-key listener to be added.
    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
