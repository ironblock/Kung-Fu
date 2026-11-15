import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

const BIG_WORLD_SPEED_MULTIPLIER = 20;

/**
 * Attaches the library's default free-camera keyboard/mouse controls, with
 * keyboard movement scaled up by BIG_WORLD_SPEED_MULTIPLIER. Mouse look is
 * untouched because only `camera.speed` (translation) is changed.
 *
 * Returns a function that detaches the controls and restores the original speed.
 * Nothing is left running per frame.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const baseSpeed = camera.speed;
    const detachDefaultControls = attachFreeControl(camera, canvas, scene);
    camera.speed = baseSpeed * BIG_WORLD_SPEED_MULTIPLIER;

    return () => {
        detachDefaultControls();
        camera.speed = baseSpeed;
    };
}
