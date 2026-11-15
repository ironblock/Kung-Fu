import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Fly controls for a FreeCamera, with Shift as a speed-only key.
//
// The default attachFreeControl maps ShiftLeft/ShiftRight to "down", so Shift
// would sink the camera. attachConfigurableFreeControl lets us replace the
// up/down keys: Space rises, PageDown sinks, and Shift is only a speed key.
// W/A/S/D and the arrow keys move, and the mouse drag looks around.
export function attachFlyControls(
    camera: FreeCamera,
    canvas: HTMLCanvasElement,
    scene: SceneContext,
): () => void {
    const detach = attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
    return detach;
}
