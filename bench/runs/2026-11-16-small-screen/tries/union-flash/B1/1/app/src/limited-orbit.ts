import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachControl, setCameraLimits } from "@babylonjs/lite";

function normalizeRadiusRange(
  minDistance: number,
  maxDistance: number
): { lower: number; upper: number } {
  let lower = minDistance;
  let upper = maxDistance;

  if (lower > upper) {
    const tmp = lower;
    lower = upper;
    upper = tmp;
  }

  if (!Number.isFinite(lower)) {
    lower = 0;
  }
  if (!Number.isFinite(upper)) {
    upper = Number.POSITIVE_INFINITY;
  }

  if (lower < 0) {
    lower = 0;
  }
  if (upper < lower) {
    upper = lower;
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
  const { lower, upper } = normalizeRadiusRange(minDistance, maxDistance);

  let detachLimits: (() => void) | undefined;
  try {
    detachLimits = setCameraLimits(
      camera,
      { lowerRadiusLimit: lower, upperRadiusLimit: upper },
      scene
    );
  } catch (error) {
    throw error;
  }

  let detachControls: (() => void) | undefined;
  try {
    detachControls = attachControl(camera, canvas, scene, { keyboard: false });
  } catch (error) {
    detachLimits?.();
    throw error;
  }

  let disposed = false;
  return () => {
    if (disposed) {
      return;
    }
    disposed = true;

    try {
      detachControls?.();
    } finally {
      detachLimits?.();
    }
  };
}
