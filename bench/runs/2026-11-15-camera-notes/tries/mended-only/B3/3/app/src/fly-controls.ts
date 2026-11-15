import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Fly controls for the architecture walkthrough.
//
// The library's default free-camera bindings put "down" on Shift, so using
// attachFreeControl as-is would make Shift sink the camera. The configurable
// variant lets us rebind the vertical keys: only Space rises and only PageDown
// sinks, and Shift is used purely as a speed multiplier.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detach = attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });

    return () => {
        detach();
    };
}
