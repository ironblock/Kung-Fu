import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// The library's fly controls with Shift taken off the down keys; Shift triples camera.speed while held.
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    const detach = attachConfigurableFreeControl(camera, canvas, scene, { upKeys: ["Space", "PageUp"], downKeys: ["PageDown"] });
    const isShift = (e: KeyboardEvent): boolean => e.code === "ShiftLeft" || e.code === "ShiftRight";
    const down = (e: Event): void => {
        if (isShift(e as KeyboardEvent)) camera.speed *= 3;
    };
    const up = (e: Event): void => {
        if (isShift(e as KeyboardEvent)) camera.speed /= 3;
    };
    canvas.addEventListener("keydown", down);
    canvas.addEventListener("keyup", up);
    return () => {
        detach();
        canvas.removeEventListener("keydown", down);
        canvas.removeEventListener("keyup", up);
    };
}
