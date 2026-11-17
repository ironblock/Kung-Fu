import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { interpolateArcRotateCamera } from "@babylonjs/lite";

const TWO_PI = Math.PI * 2;
const MAX_SEGMENT = Math.PI / 2; // quarter turn: always a positive shortest arc
const SEGMENT_ROUNDING_EPS = 1e-12;

interface SavedAlphaLimits {
  lower?: number;
  upper?: number;
  deletedLower: boolean;
  deletedUpper: boolean;
}

function clearPendingMotion(camera: ArcRotateCamera): void {
  camera.inertialAlphaOffset = 0;
  camera.inertialBetaOffset = 0;
  camera.inertialRadiusOffset = 0;
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;
}

function liftAlphaLimits(
  camera: ArcRotateCamera,
  startAlpha: number,
  finalAlpha: number
): SavedAlphaLimits {
  const saved: SavedAlphaLimits = {
    lower: camera.lowerAlphaLimit,
    upper: camera.upperAlphaLimit,
    deletedLower: false,
    deletedUpper: false,
  };

  // Lift only bounds that would actually interfere with this positive numeric rotation.
  if (
    saved.lower !== undefined &&
    !(startAlpha >= saved.lower && finalAlpha >= saved.lower)
  ) {
    delete camera.lowerAlphaLimit;
    saved.deletedLower = true;
  }

  if (
    saved.upper !== undefined &&
    !(startAlpha <= saved.upper && finalAlpha <= saved.upper)
  ) {
    delete camera.upperAlphaLimit;
    saved.deletedUpper = true;
  }

  return saved;
}

function restoreAlphaLimitsIfPossible(
  camera: ArcRotateCamera,
  saved: SavedAlphaLimits
): void {
  const alpha = camera.alpha;

  if (saved.deletedLower && saved.lower !== undefined && alpha >= saved.lower) {
    camera.lowerAlphaLimit = saved.lower;
  }

  if (saved.deletedUpper && saved.upper !== undefined && alpha <= saved.upper) {
    camera.upperAlphaLimit = saved.upper;
  }
}

export async function spinAround(
  camera: ArcRotateCamera,
  scene: SceneContext,
  turns: number
): Promise<void> {
  if (!Number.isFinite(turns)) {
    throw new RangeError("turns must be finite");
  }

  if (!Number.isFinite(camera.alpha)) {
    throw new RangeError("camera.alpha must be finite");
  }

  // The request says the tour always turns in the direction alpha grows.
  const magnitude = Math.abs(turns);
  if (magnitude === 0) {
    return;
  }

  const totalDelta = magnitude * TWO_PI;
  if (!Number.isFinite(totalDelta)) {
    throw new RangeError("turns is too large");
  }

  const startAlpha = camera.alpha;
  const finalAlpha = startAlpha + totalDelta;

  if (!Number.isFinite(finalAlpha)) {
    throw new RangeError("resulting alpha is not finite");
  }

  // If the requested rotation is not representable at this numeric magnitude,
  // there is nothing to glide; the camera is already at the target alpha.
  if (finalAlpha === startAlpha) {
    return;
  }

  // Split into arcs smaller than π so interpolateArcRotateCamera's shortest-arc
  // rule cannot choose the backward direction.  Quarter turns are also natural
  // for common values like 0.75, 1, and 2.
  const segmentCount = Math.max(
    1,
    Math.ceil(totalDelta / MAX_SEGMENT - SEGMENT_ROUNDING_EPS)
  );

  if (!Number.isSafeInteger(segmentCount)) {
    throw new RangeError("turns is too large");
  }

  const segmentDelta = totalDelta / segmentCount;

  const savedInertia = camera.inertia;
  const savedPanningInertia = camera.panningInertia;
  const savedLimits = liftAlphaLimits(camera, startAlpha, finalAlpha);

  try {
    for (let i = 0; i < segmentCount; i++) {
      // Remove any pending inertial motion so an existing drag/wheel/pan cannot
      // change alpha/beta/radius/target between interpolation frames.
      clearPendingMotion(camera);

      const goal =
        i === segmentCount - 1
          ? finalAlpha
          : startAlpha + (i + 1) * segmentDelta;

      await interpolateArcRotateCamera(camera, scene, { alpha: goal });

      // Between transitions, yield once so the previous interpolation can finish
      // its own cleanup before we start another call on the same camera.
      if (i !== segmentCount - 1) {
        await Promise.resolve();
      }
    }
  } finally {
    clearPendingMotion(camera);
    camera.inertia = savedInertia;
    camera.panningInertia = savedPanningInertia;
    restoreAlphaLimitsIfPossible(camera, savedLimits);
  }
}
