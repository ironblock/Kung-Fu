import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How much further every movement key moves the camera than the library default. */
const MOVE_SCALE = 20;

/**
 * Attaches the library's free-camera keyboard and mouse controls to `canvas`,
 * with movement keys scaled by MOVE_SCALE.
 *
 * Only `camera.speed` is changed, which scales the per-frame key movement.
 * Mouse look uses `angularSensitivity`, which is left alone, so drags turn the
 * camera exactly as the library's default does.
 *
 * Returns a function that detaches the controls and restores the original speed.
 * No per-frame hook of our own is installed.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const baseSpeed = camera.speed;
    camera.speed = baseSpeed * MOVE_SCALE;

    const detach = attachFreeControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) return;
        detached = true;
        detach();
        camera.speed = baseSpeed;
    };
}
