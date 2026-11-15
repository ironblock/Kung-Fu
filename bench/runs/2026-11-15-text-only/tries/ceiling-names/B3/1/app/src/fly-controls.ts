import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

/**
 * Keyboard + mouse fly controls for the walkthrough's free camera.
 *
 * - W/A/S/D or arrow keys: move (library defaults)
 * - Mouse: look around (library defaults)
 * - Space: rise
 * - PageDown: sink
 * - Shift (left or right): move 3x faster; never moves the camera vertically
 *
 * The vertical and speed keys are all set explicitly so that none of the
 * library's default vertical bindings (which could include Shift) remain
 * active. Both `KeyboardEvent.key` and `KeyboardEvent.code` spellings are
 * listed, since the declarations do not say which one the library matches.
 *
 * Returns a function that removes the canvas listeners and the per-frame
 * update registered on the scene.
 */
export function attachFlyControls(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const detach = attachConfigurableFreeControl(camera, canvas, scene, {
    upKeys: [" ", "Space", "Spacebar"],
    downKeys: ["PageDown"],
    fastKeys: ["Shift", "ShiftLeft", "ShiftRight"],
    fastMultiplier: 3,
  });

  let detached = false;
  return () => {
    if (detached) return;
    detached = true;
    detach();
  };
}
