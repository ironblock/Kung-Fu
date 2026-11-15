import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
    onSceneDispose,
    type ArcRotateCamera,
    type SceneContext,
} from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

/**
 * Create an orbit camera looking at the origin from 10 units away, with the
 * library's mouse and touch controls and arrow-key control on the canvas.
 *
 * The camera is returned but not assigned to `scene.camera`; the caller decides
 * when to make it the active camera.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // Keyboard input is an opt-in. Must run before attachControl with `keyboard`.
    // Process-global and idempotent, so calling it per camera is harmless.
    enableArcRotateKeyboardControls();

    const detach = attachControl(camera, canvas, scene, { keyboard: true });

    // attachControl only removes canvas listeners when its cleanup runs. Tie it
    // to the scene so disposeScene(scene) also detaches the controls.
    onSceneDispose(scene, detach);

    return camera;
}
