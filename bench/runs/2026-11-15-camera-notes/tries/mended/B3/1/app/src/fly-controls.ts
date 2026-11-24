import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Fly controls for the free camera: W/A/S/D or arrows to move, mouse drag to look,
// Space to rise, PageDown to sink, and Shift (either side) for a 3x speed boost.
//
// upKeys and downKeys are set explicitly so that no default key (including Shift)
// can move the camera vertically; fastKeys only scales the speed.
// Key names are KeyboardEvent.code values.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
