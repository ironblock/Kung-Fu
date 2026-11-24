import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Rise on Space, sink on PageDown. The library defaults also map ShiftLeft and
// ShiftRight to "down" and PageUp to "up"; those are overridden here so that
// holding Shift only changes speed and never moves the camera vertically.
const FLY_UP_KEYS: readonly string[] = ["Space"];
const FLY_DOWN_KEYS: readonly string[] = ["PageDown"];
const FLY_FAST_KEYS: readonly string[] = ["ShiftLeft", "ShiftRight"];
const FLY_FAST_MULTIPLIER = 3;

/**
 * Attach fly-through keyboard and mouse controls to a free camera.
 *
 * - W/A/S/D or arrow keys: move (library defaults).
 * - Mouse: look around (library defaults).
 * - Space: rise. PageDown: sink.
 * - Shift (left or right): hold for 3x movement speed only.
 *
 * Returns the library's cleanup, which removes the canvas listeners and the
 * per-frame hook registered on `scene`. Call it to detach the controls.
 */
export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
    return attachConfigurableFreeControl(camera, canvas, scene, {
        upKeys: FLY_UP_KEYS,
        downKeys: FLY_DOWN_KEYS,
        fastKeys: FLY_FAST_KEYS,
        fastMultiplier: FLY_FAST_MULTIPLIER,
    });
}
