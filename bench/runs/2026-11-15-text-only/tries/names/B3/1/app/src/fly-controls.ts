import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Shift is only a speed modifier. It is deliberately absent from the up and
// down key lists so that holding it can never raise or lower the camera.
// Both KeyboardEvent.code and KeyboardEvent.key spellings are listed so the
// mapping works whichever form the library matches on.
const UP_KEYS = ["Space", " "] as const;
const DOWN_KEYS = ["PageDown"] as const;
const FAST_KEYS = ["ShiftLeft", "ShiftRight", "Shift"] as const;
const FAST_MULTIPLIER = 3;

export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detach = attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: UP_KEYS,
        downKeys: DOWN_KEYS,
        fastKeys: FAST_KEYS,
        fastMultiplier: FAST_MULTIPLIER,
    });
    return detach;
}
