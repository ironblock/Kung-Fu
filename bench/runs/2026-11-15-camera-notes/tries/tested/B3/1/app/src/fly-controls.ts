import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Shift is only a speed key: it is listed in fastKeys and nowhere in upKeys or
// downKeys, so holding it never moves the camera vertically on its own.
// upKeys and downKeys are given explicitly because upKeys replaces the library's
// default up keys, and the default down keys are not documented in our notes.
const FLY_OPTIONS = {
    upKeys: ["Space"],
    downKeys: ["PageDown"],
    fastKeys: ["ShiftLeft", "ShiftRight"],
    fastMultiplier: 3,
} as const;

/**
 * Attaches keyboard and mouse fly controls to a free camera.
 * W/A/S/D or arrow keys move, mouse drag looks around, Space rises, PageDown sinks,
 * and Shift (either side) moves three times as fast.
 * The returned function removes the canvas listeners and the per-frame hook.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: [...FLY_OPTIONS.upKeys],
        downKeys: [...FLY_OPTIONS.downKeys],
        fastKeys: [...FLY_OPTIONS.fastKeys],
        fastMultiplier: FLY_OPTIONS.fastMultiplier,
    });
}
