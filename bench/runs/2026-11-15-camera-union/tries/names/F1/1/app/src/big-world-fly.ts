import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Movement multiplier applied to the library's default fly speed.
const FAST_MULTIPLIER = 20;

/**
 * Attaches the library's default free-camera keyboard and mouse controls to
 * `camera`, with keyboard movement (WASD, arrows, rise/sink keys) scaled by
 * FAST_MULTIPLIER. Mouse look is left at the library's defaults.
 *
 * Returns a function that detaches the controls and restores the camera's
 * original speed.
 */
export function attachBigWorldFly(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const defaultSpeed = camera.speed;
    const detachControls = attachFreeControl(camera, canvas, scene);

    camera.speed = defaultSpeed * FAST_MULTIPLIER;

    return () => {
        detachControls();
        camera.speed = defaultSpeed;
    };
}
