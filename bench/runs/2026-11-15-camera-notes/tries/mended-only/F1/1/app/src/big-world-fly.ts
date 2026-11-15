import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

const KEY_SPEED_FACTOR = 20;

/**
 * Attaches the library's default free-camera keyboard and mouse controls to
 * the canvas, with key movement made KEY_SPEED_FACTOR times as fast.
 *
 * Key movement is driven by the camera's `speed` (each held move key adds
 * speed * deltaMs / sqrt(100000) to the move each frame), so scaling `speed`
 * scales every movement key the library handles, including rise and sink.
 * Mouse look is driven by pitch/yaw and angularSensitivity, which are left
 * untouched, so drags turn the camera exactly as the defaults do.
 *
 * Returns a function that removes the controls and restores the original speed.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const baseSpeed = camera.speed;
    if (typeof baseSpeed !== "number") {
        throw new Error("attachBigWorldFly: camera.speed is not a number; key speed cannot be scaled.");
    }

    // Set before attaching so the scale applies whether the library reads speed
    // at attach time or on every frame.
    camera.speed = baseSpeed * KEY_SPEED_FACTOR;

    const detachLibraryControls = attachFreeControl(camera, canvas, scene);

    return () => {
        detachLibraryControls();
        camera.speed = baseSpeed;
    };
}
