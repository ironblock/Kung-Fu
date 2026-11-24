import { attachConfigurableFreeControl } from "@babylonjs/lite";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";

// Every movement key the default free control hears: WASD, the four arrows,
// Space/PageUp (rise) and ShiftLeft/ShiftRight/PageDown (sink).
const MOVE_KEYS = [
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowLeft",
  "ArrowRight",
  "ArrowDown",
  "Space",
  "PageUp",
  "ShiftLeft",
  "ShiftRight",
  "PageDown",
] as const;

/**
 * Gives the camera the library's keyboard + mouse fly controls on `canvas`,
 * with every movement key moving 20x as far as the default control while it
 * is held. Mouse look is exactly the library default.
 *
 * The 20x is done through the control's own "fast" option rather than by
 * multiplying camera.speed: the free control stops look inertia once the
 * decayed turn falls below speed * 0.001, so changing speed would also
 * change how far a drag turns the camera once it has come to rest. Leaving
 * speed alone keeps mouse look identical.
 *
 * Returns the library's disposer, which removes all canvas listeners and the
 * control's per-frame step; we add nothing of our own, so nothing is left
 * running.
 */
export function attachBigWorldFly(
  camera: FreeCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
): () => void {
  return attachConfigurableFreeControl(camera, canvas, scene, {
    fastKeys: MOVE_KEYS,
    fastMultiplier: 20,
  });
}
