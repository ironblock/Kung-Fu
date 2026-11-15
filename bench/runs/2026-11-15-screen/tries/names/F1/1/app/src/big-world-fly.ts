import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * How much faster keyboard fly movement is than the library default.
 * Only camera.speed is scaled; mouse look is driven by angularSensitivity
 * and is left untouched.
 */
const BIG_WORLD_SPEED_MULTIPLIER = 20;

/**
 * Attaches the library's default free-camera keyboard and mouse controls to
 * `canvas`, with every movement key moving the camera BIG_WORLD_SPEED_MULTIPLIER
 * times as far per held key as the default does.
 *
 * Returns a function that removes the controls and restores the camera's
 * original speed. It adds no listeners and no per-frame work of its own.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const baseSpeed = camera.speed;
    camera.speed = baseSpeed * BIG_WORLD_SPEED_MULTIPLIER;

    const detachDefault = attachFreeControl(camera, canvas, scene);

    let detached = false;
    return () => {
        if (detached) {
            return;
        }
        detached = true;
        detachDefault();
        camera.speed = baseSpeed;
    };
}
