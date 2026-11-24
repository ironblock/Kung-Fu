import { interpolateArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = 2 * Math.PI;

// Spins on the same camera run one after another. A second interpolation on a
// camera makes the first one reject, so a second Tour click waits its turn.
const queues = new WeakMap<ArcRotateCamera, Promise<void>>();

/**
 * Glides the orbit camera around the model by `turns` full turns, in the
 * direction in which alpha grows. Distance, beta and target are left alone.
 * Resolves when the camera has arrived at alpha + 2π·turns.
 *
 * If another spin is already running on this camera, this one starts when
 * that one finishes; alpha is read at that point.
 */
export function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    return Promise.reject(
      new RangeError(`turns must be a finite number >= 0, got ${turns}`),
    );
  }

  const previous = queues.get(camera) ?? Promise.resolve();
  const run = previous.then(() =>
    interpolateArcRotateCamera(camera, scene, {
      alpha: camera.alpha + TWO_PI * turns,
    }),
  );

  // Keep the queue alive even when this spin fails, so later spins still run.
  queues.set(camera, run.catch(() => undefined));
  return run;
}
