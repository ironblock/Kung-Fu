import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

const BOOST_MULTIPLIER = 3;

/**
 * Keyboard + mouse fly controls for a FreeCamera.
 *
 * - W/A/S/D and the arrow keys move (library defaults).
 * - Mouse drag looks around (library default).
 * - Space rises, PageDown sinks. Shift is NOT a vertical key here: it only
 *   triples speed while held (fastKeys), so it never moves the camera on its own.
 *
 * Returns a cleanup function that removes all listeners and the per-frame hook.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    // Keyboard events need a focusable canvas. Mirror attachFreeControl, but only
    // add the tabindex if it is absent, so cleanup can restore the original state.
    const addedTabIndex = !canvas.hasAttribute("tabindex");
    if (addedTabIndex) {
        canvas.tabIndex = 0;
    }

    const detach = attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: ["Space"],
        downKeys: ["PageDown"],
        fastKeys: ["ShiftLeft", "ShiftRight"],
        fastMultiplier: BOOST_MULTIPLIER,
    });

    return () => {
        detach();
        if (addedTabIndex) {
            canvas.removeAttribute("tabindex");
        }
    };
}
