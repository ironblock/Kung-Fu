import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

const MOVEMENT_MULTIPLIER = 20;

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const baseSpeed = camera.speed;
    camera.speed = baseSpeed * MOVEMENT_MULTIPLIER;

    let detachLibrary: () => void;
    try {
        detachLibrary = attachFreeControl(camera, canvas, scene);
    } catch (error) {
        camera.speed = baseSpeed;
        throw error;
    }

    let disposed = false;
    return () => {
        if (disposed) {
            return;
        }
        disposed = true;
        detachLibrary();
        camera.speed = baseSpeed;
    };
}
