import { ArcRotateCamera, Vector3, attachControl, type SceneContext } from "@babylonjs/lite";

// Not verified against the library: the arrow-key entry point below is a guessed name.
// Check it against the Babylon Lite 1.39.0 exports before relying on it.
import { attachArrowKeyControl } from "@babylonjs/lite";

export function createOrbitCamera(canvas: HTMLCanvasElement, scene: SceneContext): ArcRotateCamera {
    // Orbit camera looking at the origin from 10 units away.
    const camera = new ArcRotateCamera("orbit", 0, Math.PI / 2, 10, new Vector3(0, 0, 0), scene);

    // Pass the scene: without it, the arc-rotate control only accumulates inertia and never applies it.
    attachControl(camera, canvas, scene);

    // Arrow keys to turn the camera (unverified call, see note above).
    attachArrowKeyControl(camera, canvas, scene);

    return camera;
}
