import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

function normalizeDistanceRange(minDistance: number, maxDistance: number): { lower: number; upper: number } {
  let lower = Math.min(minDistance, maxDistance);
  let upper = Math.max(minDistance, maxDistance);

  if (Number.isNaN(lower)) lower = 0;
  if (Number.isNaN(upper)) upper = Infinity;

  if (lower === -Infinity) lower = 0;
  if (upper === -Infinity) upper = Infinity;
  if (lower === Infinity && upper === Infinity) {
    lower = 0;
    upper = Infinity;
  }

  if (lower > upper) {
    const tmp = lower;
    lower = upper;
    upper = tmp;
  }

  return { lower, upper };
}

export function attachLimitedOrbit(
  camera: ArcRotateCamera,
  canvas: HTMLCanvasElement,
  scene: SceneContext,
  minDistance: number,
  maxDistance: number
): () => void {
  const { lower, upper } = normalizeDistanceRange(minDistance, maxDistance);

  const previousLowerRadiusLimit = camera.lowerRadiusLimit;
  const previousUpperRadiusLimit = camera.upperRadiusLimit;

  const fallbackRadius = Number.isFinite(lower) && lower > 0 ? lower : 0;

  const clampRadius = () => {
    const radius = camera.radius;
    let desired = radius;

    if (!Number.isFinite(radius)) {
      desired = radius === Infinity && Number.isFinite(upper) ? upper : fallbackRadius;
    }

    if (desired < lower) desired = lower;
    if (desired > upper) desired = upper;

    if (desired !== radius) {
      camera.radius = desired;
      camera.inertialRadiusOffset = 0;
    }

    camera._clampToLimits?.();
  };

  camera.lowerRadiusLimit = lower;
  camera.upperRadiusLimit = upper;
  clampRadius();

  let detachControls: (() => void) | undefined;
  let detachLimits: (() => void) | undefined;
  let disposed = false;

  const cleanup = () => {
    if (disposed) return;
    disposed = true;

    try {
      detachControls?.();
    } finally {
      try {
        detachLimits?.();
      } finally {
        Object.assign(camera, {
          lowerRadiusLimit: previousLowerRadiusLimit,
          upperRadiusLimit: previousUpperRadiusLimit,
        });
      }
    }
  };

  try {
    detachControls = attachControl(camera, canvas, scene, { keyboard: false });
    detachLimits = setCameraLimits(camera, { lowerRadiusLimit: lower, upperRadiusLimit: upper }, scene);
  } catch (error) {
    cleanup();
    throw error;
  }

  clampRadius();

  return cleanup;
}
