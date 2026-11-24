import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

export function attachFlyControls(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  // Use configurable free controls so Shift can be a pure speed modifier.
  // Replace the default down keys to avoid Shift moving the camera down.
  // Space rises, PageDown sinks, and left/right Shift triples movement speed.
  const detach = attachConfigurableFreeControl(camera, canvas, scene, {
    upKeys: ["Space"],
    downKeys: ["PageDown"],
    fastKeys: ["ShiftLeft", "ShiftRight"],
    fastMultiplier: 3,
  });

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    detach();
  };
}
