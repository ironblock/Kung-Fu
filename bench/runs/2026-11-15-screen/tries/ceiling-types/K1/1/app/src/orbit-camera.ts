import {
    attachControl,
    createArcRotateCamera,
    enableArcRotateKeyboardControls,
} from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

/**
 * Creates an orbit camera that looks at the origin from 10 units away, with the
 * library's default mouse/touch controls and its Arrow-key controls attached to
 * `canvas`. Inertia is driven by `scene`'s render loop.
 */
export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    const camera = createArcRotateCamera(-Math.PI / 2, Math.PI / 2.5, 10, { x: 0, y: 0, z: 0 });

    // Keyboard input is an opt-in module. If it hasn't been installed when
    // attachControl runs, `keyboard: true` is quietly ignored, so it must come first.
    // It is process-global and idempotent, so calling it on every camera is fine.
    enableArcRotateKeyboardControls();
    attachControl(camera, canvas, scene, { keyboard: true });

    return camera;
}
