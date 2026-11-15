import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

// Keyboard movement in the library's free-camera controls is proportional to
// camera.speed (per frame: speed * max(deltaMs, 1) / sqrt(100000), then decayed
// by inertia). Scaling speed therefore scales every movement key, including
// any rise/sink keys, by the same factor. Mouse look is driven by
// angularSensitivity and inertia, which are left untouched, so drag rotation
// is unchanged.
const MOVE_SPEED_SCALE = 20;

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const baseSpeed = camera.speed;
    const scaledSpeed = baseSpeed * MOVE_SPEED_SCALE;
    camera.speed = scaledSpeed;

    const detach = attachFreeControl(camera, canvas, scene);

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        detach();
        // Restore the original speed unless the caller changed it while attached.
        if (camera.speed === scaledSpeed) {
            camera.speed = baseSpeed;
        }
    };
}
