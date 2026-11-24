import type { GeospatialCamera, SceneContext } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;

// Smoothstep: 0 at t = 0, 1 at t = 1, and never decreasing, so the yaw only moves forward.
function ease(t: number): number {
  return t * t * (3 - 2 * t);
}

// UNVERIFIED: the library is not available here, so this is the assumed way to get a
// per-frame callback from the scene's render loop. Check it against Babylon Lite 1.39.0.
function onSceneBeforeRender(scene: SceneContext, fn: (deltaMs: number) => void): () => void {
  const observer = (scene as any).onBeforeRenderObservable.add(fn);
  return () => (scene as any).onBeforeRenderObservable.remove(observer);
}

/**
 * Turns the camera's heading one full turn toward increasing yaw over about `durationMs`
 * of the scene's render loop, then leaves it at the starting heading.
 * Centre, pitch and radius are left as they are. Resolves when the turn is complete.
 */
export function spinAround(camera: GeospatialCamera, scene: SceneContext, durationMs: number): Promise<void> {
  return new Promise<void>((resolve) => {
    const startYaw = camera.yaw;
    const duration = Math.max(durationMs, 0);
    let elapsed = 0;
    let finished = false;
    let unsubscribe: () => void = () => {};

    const onFrame = (deltaMs: number): void => {
      if (finished) {
        return;
      }
      elapsed += Math.max(deltaMs, 0);
      const t = duration > 0 ? Math.min(elapsed / duration, 1) : 1;

      // Pitch and radius are passed back unchanged so the write does not disturb them
      // (a yaw-only write would re-clamp pitch against the radius).
      camera.setGeospatialOrientation({
        yaw: startYaw + TWO_PI * ease(t),
        pitch: camera.pitch,
        radius: camera.radius,
      });

      if (t >= 1) {
        finished = true;
        unsubscribe();
        resolve();
      }
    };

    unsubscribe = onSceneBeforeRender(scene, onFrame);
  });
}
