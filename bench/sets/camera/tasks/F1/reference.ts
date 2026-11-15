import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// The library's per-frame cut-off for the turn glide is camera.speed * 0.001, so raising
// camera.speed would kill the glide. Keep speed and multiply movement through the fast keys,
// listing every movement key as a fast key.
const MOVE_KEYS = ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "PageUp", "ShiftLeft", "ShiftRight", "PageDown"];

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, { fastKeys: MOVE_KEYS, fastMultiplier: 20 });
}
