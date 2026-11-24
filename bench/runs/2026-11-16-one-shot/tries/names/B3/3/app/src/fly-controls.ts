import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

// Shift is deliberately absent from both vertical lists, so holding it never moves the camera up or down.
const FLY_UP_KEYS = ["Space", " "] as const;
const FLY_DOWN_KEYS = ["PageDown"] as const;
const FLY_FAST_KEYS = ["ShiftLeft", "ShiftRight", "Shift"] as const;
const FAST_MULTIPLIER = 3;

export function attachFlyControls(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const dispose = attachConfigurableFreeControl(camera, canvas, scene, {
    upKeys: FLY_UP_KEYS,
    downKeys: FLY_DOWN_KEYS,
    fastKeys: FLY_FAST_KEYS,
    fastMultiplier: FAST_MULTIPLIER,
  });

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    dispose();
  };
}
