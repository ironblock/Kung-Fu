import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Fly-through controls for a FreeCamera: W/A/S/D or arrows to move, mouse drag to look,
 * Space to rise, PageDown to sink, and Shift (either side) for a 3x speed boost.
 *
 * Uses the configurable variant rather than attachFreeControl, because the default
 * vertical mapping binds Shift to "move down". Here Shift is only a speed key and is
 * not part of upKeys or downKeys, so holding it never changes the camera's height.
 *
 * Returns the cleanup function from the library, which removes the canvas listeners
 * and the per-frame (beforeRender) hook.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        // Both key names are listed so the boost works whether the library matches
        // KeyboardEvent.code (ShiftLeft/ShiftRight) or KeyboardEvent.key ("Shift").
        fastKeys: ["ShiftLeft", "ShiftRight", "Shift"],
        fastMultiplier: 3,
    });
}
