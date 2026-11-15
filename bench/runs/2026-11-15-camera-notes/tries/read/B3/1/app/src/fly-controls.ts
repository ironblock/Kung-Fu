import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Fly-through controls for a FreeCamera: W/A/S/D or arrows to move, mouse drag to look,
 * Space to rise, PageDown to sink. Holding either Shift makes movement three times as fast.
 *
 * Shift is only a speed key here. It is not bound to up or down, so holding it never
 * moves the camera vertically on its own. Up and down are replaced with Space and PageDown,
 * because the library's defaults bind Shift to down.
 *
 * Returns a function that removes the listeners and the per-frame update.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // The library gives the canvas tabIndex 0 when it has none, so keys reach it.
    // Remember whether we need to undo that on detach.
    const tabIndexWasMissing = !canvas.hasAttribute("tabindex");

    const detach = attachConfigurableFreeControl(camera, canvas, scene, {
        // Both forms are listed so the match works whether the library compares
        // KeyboardEvent.key or KeyboardEvent.code. "Space" and "PageDown" are the same in both.
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight", "Shift"],
        fastMultiplier: 3,
    });

    return () => {
        detach();
        if (tabIndexWasMissing) {
            canvas.removeAttribute("tabindex");
        }
    };
}
