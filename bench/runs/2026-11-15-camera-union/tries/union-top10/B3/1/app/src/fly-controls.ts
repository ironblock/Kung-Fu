import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Fly-through controls for the architecture walkthrough.
//
// Uses the library's configurable free-camera controls, which provide the
// WASD / arrow-key movement and mouse look. Space rises, PageDown sinks, and
// either Shift key multiplies speed by 3. Shift is only in fastKeys, never in
// upKeys or downKeys, so holding it does not change height on its own.
//
// Returns the library's disposer, which removes the canvas listeners and any
// per-frame work it registered.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: 3,
    });
}
