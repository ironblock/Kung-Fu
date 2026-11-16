import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const ORBIT_RADIUS = 10;

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // Start at the origin, 10 units away, on the horizontal plane.
    const camera = createArcRotateCamera(0, Math.PI / 2, ORBIT_RADIUS, { x: 0, y: 0, z: 0 });

    // attachControl ignores keyboard: true unless this has run first.
    enableArcRotateKeyboardControls();

    // The scene is required, otherwise drags and wheel do not move the camera.
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
