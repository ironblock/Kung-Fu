import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

// interpolateArcRotateCamera takes the shortest arc of alpha modulo 2π
// (camera-notes.md, note 56). A single goal of start + 2π·turns would therefore
// either do nothing (whole turns) or turn the wrong way (e.g. 0.75 turns).
// So the spin is split into segments, each under π in size, all positive.
const MAX_SEGMENT = Math.PI / 2;

export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number,
): Promise<void> {
  if (!Number.isFinite(turns) || turns < 0) {
    throw new RangeError(`turns must be a finite number >= 0, got ${turns}`);
  }

  const start = camera.alpha;
  const total = 2 * Math.PI * turns;
  if (total === 0) {
    return;
  }
  const end = start + total;
  const steps = Math.max(1, Math.ceil(total / MAX_SEGMENT));

  // Run the segments one after another: a second call on the camera
  // while one is running makes the first promise reject (note 6).
  for (let k = 1; k <= steps; k++) {
    // Absolute goals, so rounding does not accumulate; the last one is exact.
    const alpha = k === steps ? end : start + (total * k) / steps;
    await interpolateArcRotateCamera(camera, scene, {
      alpha,
      beta: camera.beta,
      radius: camera.radius,
      target: { x: camera.target.x, y: camera.target.y, z: camera.target.z },
    });
  }
}
