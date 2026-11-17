import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";

export function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (turns === 0) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const targetAlpha = camera.alpha + 2 * Math.PI * turns;
    const interpolationFactor = 0.1;
    let lastTime: number | null = null;

    function frame(time: number): void {
      if (lastTime === null) {
        // First frame: zero inertial offsets so they cannot interfere
        // (mirrors what interpolateArcRotateCamera does on its first frame).
        camera.inertialAlphaOffset = 0;
        camera.inertialBetaOffset = 0;
        camera.inertialRadiusOffset = 0;
        camera.inertialPanningX = 0;
        camera.inertialPanningY = 0;
        lastTime = time;
        requestAnimationFrame(frame);
        return;
      }

      const dt = Math.max((time - lastTime) / 1000, 1 / 60);
      lastTime = time;

      // Library easing: move (1 - 2^(-dt / factor)) of the remaining distance.
      const remaining = targetAlpha - camera.alpha;
      const fraction = 1 - Math.pow(2, -dt / interpolationFactor);
      camera.alpha += fraction * remaining;

      // Snap exactly to the goal once close enough (avoids floating-point drift).
      if (Math.abs(targetAlpha - camera.alpha) < 1e-10) {
        camera.alpha = targetAlpha;
        resolve();
        return;
      }

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  });
}
