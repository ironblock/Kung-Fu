import { attachControl, createArcRotateCamera, enableArcRotateKeyboardControls, type ArcRotateCamera, type SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;
const INITIAL_ALPHA = -Math.PI / 2;
const INITIAL_BETA = Math.PI / 3;

/**
 * Create an orbit camera looking at the origin from 10 units away, with mouse and
 * touch controls on the canvas and arrow-key control enabled.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(INITIAL_ALPHA, INITIAL_BETA, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // The keyboard factory must be installed before attachControl samples it; attachControl
    // ignores keyboard options silently otherwise.
    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
