import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

const FLY_SPEED_MULTIPLIER = 20;

/**
 * Attaches the library's default free-camera fly controls with movement sped up
 * 20x. Only `camera.speed` is scaled, so mouse look (driven by angularSensitivity)
 * is exactly the library default. Returns a function that removes the controls
 * and restores the camera's original speed. Nothing runs per frame.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const baseSpeed = camera.speed;
    camera.speed = baseSpeed * FLY_SPEED_MULTIPLIER;

    const detachControls = attachFreeControl(camera, canvas, scene);

    return () => {
        detachControls();
        camera.speed = baseSpeed;
    };
}
