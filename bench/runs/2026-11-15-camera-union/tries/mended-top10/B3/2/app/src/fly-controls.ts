import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Fly-through controls for the architecture walkthrough.
// W/A/S/D and arrow keys move, the mouse looks around, Space rises, PageDown sinks.
// Shift (either side) is a speed key only: it is not bound to up or down.
//
// Keys are listed both by KeyboardEvent.code and KeyboardEvent.key so the
// mapping works whichever of the two the library matches on.
const UP_KEYS = ["Space", " "] as const;
const DOWN_KEYS = ["PageDown"] as const;
const FAST_KEYS = ["ShiftLeft", "ShiftRight", "Shift"] as const;

/**
 * Attaches the library's free-camera keyboard and mouse fly controls to `canvas`.
 * Holding Shift makes the camera move three times as fast.
 *
 * @returns A function that removes the controls and their listeners.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: FAST_KEYS,
        fastMultiplier: 3,
    });
}
