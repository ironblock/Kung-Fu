import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

/** Smoothstep: 0 at t=0, 1 at t=1, eases in and out, never decreases. */
function ease(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Subscribes `cb` to the scene's per-frame callback and returns an unsubscribe function.
 * This is the only place that touches the SceneContext render-loop API.
 * NOTE: not verified against Babylon Lite 1.39.0 (library not available locally).
 */
function onBeforeRender(scene: SceneContext, cb: () => void): () => void {
  const observer = scene.onBeforeRenderObservable.add(cb);
  return () => scene.onBeforeRenderObservable.remove(observer);
}

/**
 * Turns the camera's heading (yaw) one full turn toward increasing yaw (east),
 * over about `durationMs` of the scene's render loop, with ease-in/ease-out.
 * Centre, pitch (tilt) and radius (zoom) are not touched. The camera ends at the
 * heading it started with. Resolves once the turn is complete.
 *
 * The start yaw and start time are taken at the first rendered frame, not at the call.
 */
export function spinAround(
  camera: GeospatialCamera,
  scene: SceneContext,
  durationMs: number,
): Promise<void> {
  return new Promise<void>((resolve) => {
    let startYaw: number | undefined;
    let startTime: number | undefined;
    let unsubscribe: () => void = () => {};

    unsubscribe = onBeforeRender(scene, () => {
      const now = performance.now();
      if (startYaw === undefined || startTime === undefined) {
        startYaw = camera.yaw;
        startTime = now;
      }

      const t = durationMs > 0 ? Math.min(1, (now - startTime) / durationMs) : 1;

      if (t >= 1) {
        // Set the exact starting heading so the end state matches the start
        // (yaw is wrapped to [-PI, PI), so startYaw + 2PI would read back the same).
        camera.yaw = startYaw;
        unsubscribe();
        resolve();
        return;
      }

      // Unwrapped, monotonic increase over one full turn; the camera wraps the value itself.
      camera.yaw = startYaw + TWO_PI * ease(t);
    });
  });
}
