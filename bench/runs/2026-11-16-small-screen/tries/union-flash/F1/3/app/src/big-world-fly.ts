import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachConfigurableFreeControl } from "@babylonjs/lite";

const BIG_WORLD_MULTIPLIER = 20;

// KeyboardEvent.code values for the default free-camera movement keys:
// WASD, arrows, and the keys that rise/sink.
const BIG_WORLD_MOVEMENT_KEYS = [
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "PageUp",
  "ShiftLeft",
  "ShiftRight",
  "PageDown",
];

export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  const hadTabIndex = canvas.hasAttribute("tabindex");
  const originalTabIndex = hadTabIndex ? canvas.getAttribute("tabindex") : null;

  const dispose = attachConfigurableFreeControl(camera, canvas, scene, {
    fastKeys: [...BIG_WORLD_MOVEMENT_KEYS],
    fastMultiplier: BIG_WORLD_MULTIPLIER,
  });

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;

    dispose();

    if (hadTabIndex && originalTabIndex !== null) {
      canvas.setAttribute("tabindex", originalTabIndex);
    } else {
      canvas.removeAttribute("tabindex");
    }
  };
}
