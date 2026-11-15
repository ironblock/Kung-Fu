import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFreeControl } from "@babylonjs/lite";

/** How much farther each movement key moves the camera than the library default. */
const MOVE_SPEED_MULTIPLIER = 20;

/**
 * Attach the library's default free-camera keyboard and mouse controls, with
 * keyboard movement (WASD, arrows, rise/sink keys) scaled up for large worlds.
 *
 * Mouse look is left to the library's default handler, so it is unchanged.
 * The returned function detaches the controls (canvas listeners and the
 * per-frame hook) and restores the camera's original speed. It is idempotent.
 */
export function attachBigWorldFly(camera: FreeCamera, canvas: HTMLCanvasElement, scene: SceneContext): () => void {
  const baseSpeed = camera.speed;
  camera.speed = baseSpeed * MOVE_SPEED_MULTIPLIER;

  const detachControls = attachFreeControl(camera, canvas, scene);

  let detached = false;
  return () => {
    if (detached) return;
    detached = true;
    detachControls();
    camera.speed = baseSpeed;
  };
}
