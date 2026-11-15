import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

// Keyboard fly speed is multiplied by this factor. Mouse look is not affected:
// it is driven by the camera's angular sensitivity, which this does not touch.
const FLY_SPEED_MULTIPLIER = 20;

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Attach the library's default free-camera controls unchanged, then scale the
    // camera's speed. Attaching first means a failed attach leaves the speed alone.
    const detach = attachFreeControl(camera, canvas, scene);
    const defaultSpeed = camera.speed;
    camera.speed = defaultSpeed * FLY_SPEED_MULTIPLIER;

    let attached = true;
    return () => {
        if (!attached) {
            return;
        }
        attached = false;
        detach();
        camera.speed = defaultSpeed;
    };
}
