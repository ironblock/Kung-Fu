import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

// Shift is a speed key only: it scales the camera's fly speed and never
// feeds vertical movement. Space/PageDown stay with the library's controls.
const BOOST_FACTOR = 3;

export function attachFlyControls(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
  // Assumption: FreeCamera exposes a numeric `speed` that the free controls
  // read every frame. Not verified against the library declarations.
  const baseSpeed = camera.speed;
  let boosted = false;

  const setBoost = (on: boolean): void => {
    if (on === boosted) return;
    boosted = on;
    camera.speed = on ? baseSpeed * BOOST_FACTOR : baseSpeed;
  };

  const onKey = (e: KeyboardEvent): void => {
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
      setBoost(e.type === "keydown");
    }
  };

  // Listeners live on window, not the canvas, so Shift is seen whichever
  // element has focus. Blur clears the boost so a missed keyup cannot stick.
  const onBlur = (): void => setBoost(false);

  window.addEventListener("keydown", onKey);
  window.addEventListener("keyup", onKey);
  window.addEventListener("blur", onBlur);

  // Assumption: attachFreeControl(camera, canvas, scene) registers canvas
  // listeners and a scene hook, and returns a function that removes both.
  // Passing the scene is required; without it the free controls collect input
  // but never apply it.
  const detachFreeControl = attachFreeControl(camera, canvas, scene);

  return () => {
    detachFreeControl();
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("keyup", onKey);
    window.removeEventListener("blur", onBlur);
    boosted = false;
    camera.speed = baseSpeed;
  };
}
