import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

function withKeyboardVariants(...base: string[]): readonly string[] {
  const variants = new Set<string>();

  for (const key of base) {
    variants.add(key);
    variants.add(key.toLowerCase());
    variants.add(key.toUpperCase());
  }

  return Object.freeze(Array.from(variants));
}

export function attachFlyControls(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const options = {
    // Space rises, PageDown sinks.
    // Shift is intentionally not in either vertical key array.
    upKeys: withKeyboardVariants(" ", "Space", "Spacebar"),
    downKeys: withKeyboardVariants("PageDown", "Page Down", "PgDn"),

    // Left/Right Shift only boosts movement speed.
    fastKeys: withKeyboardVariants("Shift", "ShiftLeft", "ShiftRight"),
    fastMultiplier: 3,
  };

  const dispose = attachConfigurableFreeControl(camera, canvas, scene, options);
  let cleaned = false;

  return () => {
    if (cleaned) return;
    cleaned = true;

    if (typeof dispose === "function") {
      dispose();
    }
  };
}
