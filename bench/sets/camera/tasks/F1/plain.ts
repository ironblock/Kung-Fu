import { attachFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const previous = camera.speed;
    camera.speed = previous * 20;
    const detach = attachFreeControl(camera, canvas, scene);
    return () => {
        detach();
        camera.speed = previous;
    };
}
