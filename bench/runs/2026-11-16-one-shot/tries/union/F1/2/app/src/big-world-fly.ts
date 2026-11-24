import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Default rise/sink keys from attachFreeControl (camera-notes.md, note 55).
// upKeys/downKeys replace the defaults in the configurable control (note 16),
// so they are passed explicitly to keep the same keys.
const UP_KEYS = ["Space", "PageUp"] as const;
const DOWN_KEYS = ["ShiftLeft", "ShiftRight", "PageDown"] as const;

// WASD and arrow keys (camera-notes.md, note 55).
const MOVE_KEYS = [
    "KeyW", "KeyA", "KeyS", "KeyD",
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
] as const;

const FAST_MULTIPLIER = 20;

export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Every movement key is listed as a "fast" key, so holding any of them
    // moves the camera at fastMultiplier times the default speed.
    // The returned disposer removes all listeners and the per-frame hook.
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: [...MOVE_KEYS, ...UP_KEYS, ...DOWN_KEYS],
        fastMultiplier: FAST_MULTIPLIER,
    });
}
