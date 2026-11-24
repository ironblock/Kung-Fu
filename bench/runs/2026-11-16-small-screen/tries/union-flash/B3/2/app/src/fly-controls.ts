import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

export function attachFlyControls(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const dispose = attachConfigurableFreeControl(camera, canvas, scene, {
    upKeys: ["Space"],
    downKeys: ["PageDown"],
    fastKeys: ["ShiftLeft", "ShiftRight"],
    fastMultiplier: 3,
  });

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    dispose();
  };
}
