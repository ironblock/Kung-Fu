import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/** How much farther the movement keys carry the camera than the library default. */
const FLY_SPEED_MULTIPLIER = 20;

/**
 * Attaches the library's free-camera keyboard and mouse controls to `camera`,
 * with keyboard movement scaled by FLY_SPEED_MULTIPLIER.
 *
 * Movement is scaled by raising `camera.speed` for the lifetime of the controls;
 * mouse look is left to the library unchanged (angularSensitivity is not touched).
 * Returns a function that detaches the controls and restores the previous speed.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const defaultSpeed = camera.speed;
    const boostedSpeed = defaultSpeed * FLY_SPEED_MULTIPLIER;

    camera.speed = boostedSpeed;
    const detach = attachFreeControl(camera, canvas, scene);

    return () => {
        detach();
        // Only restore if nobody else has changed the speed in the meantime.
        if (camera.speed === boostedSpeed) {
            camera.speed = defaultSpeed;
        }
    };
}
