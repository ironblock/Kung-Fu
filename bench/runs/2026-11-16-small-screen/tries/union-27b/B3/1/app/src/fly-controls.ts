import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

/**
 * Fly-through controls for the architecture walkthrough.
 *
 * Uses the library's configurable free-camera control so the canvas gets:
 *   - W/A/S/D or the arrow keys: move (the control's fixed default)
 *   - mouse drag (any button): look around (the control's fixed default)
 *   - Space: rise, PageDown: sink
 *   - ShiftLeft/ShiftRight held: all movement three times as fast
 *
 * The library's default vertical keys are Space/PageUp up and
 * ShiftLeft/ShiftRight/PageDown down, so Shift would sink the camera on its
 * own. Passing explicit upKeys/downKeys replaces those defaults entirely,
 * which drops Shift from the vertical keys (leaving it purely a speed key
 * via fastKeys/fastMultiplier) and matches the requested Space/PageDown
 * vertical controls.
 *
 * Passing the scene is required: without it the control installs its
 * listeners but never applies motion.
 *
 * Returns the control's disposer: it removes the canvas listeners and the
 * per-frame step the control installed on the scene.
 */
export function attachFlyControls(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    upKeys: ["Space"],
    downKeys: ["PageDown"],
    fastKeys: ["ShiftLeft", "ShiftRight"],
    fastMultiplier: 3,
  });
}
