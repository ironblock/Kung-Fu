import type { ArcRotateCamera } from "@babylonjs/lite";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  // Keep the existing target object and write its components in place.
  const target = camera.target;
  target.x = point.x;
  target.y = point.y;
  target.z = point.z;

  // Stop panning inertia so the target does not drift away from the picked point.
  camera.inertialPanningX = 0;
  camera.inertialPanningY = 0;

  // Temporarily disable any active arc-rotate clamping so the forced pose write below
  // cannot clamp the pose or zero inertial offsets when it hits a bound.
  const savedLowerAlpha = camera.lowerAlphaLimit;
  const savedUpperAlpha = camera.upperAlphaLimit;
  const savedLowerBeta = camera.lowerBetaLimit;
  const savedUpperBeta = camera.upperBetaLimit;
  const savedLowerRadius = camera.lowerRadiusLimit;
  const savedUpperRadius = camera.upperRadiusLimit;
  const savedClamp = camera._clampToLimits;

  camera.lowerAlphaLimit = -Infinity;
  camera.upperAlphaLimit = Infinity;
  camera.lowerBetaLimit = -Infinity;
  camera.upperBetaLimit = Infinity;
  camera.lowerRadiusLimit = -Infinity;
  camera.upperRadiusLimit = Infinity;
  camera._clampToLimits = undefined;

  // A target-only change is not dirty until an alpha/beta/radius write changes value.
  // Nudge radius away and back so the final matrix update happens in this synchronous call.
  const oldRadius = camera.radius;
  camera.radius = makeDifferentRadius(oldRadius);
  camera.radius = oldRadius;

  camera.lowerAlphaLimit = savedLowerAlpha;
  camera.upperAlphaLimit = savedUpperAlpha;
  camera.lowerBetaLimit = savedLowerBeta;
  camera.upperBetaLimit = savedUpperBeta;
  camera.lowerRadiusLimit = savedLowerRadius;
  camera.upperRadiusLimit = savedUpperRadius;
  camera._clampToLimits = savedClamp;
}

function makeDifferentRadius(value: number): number {
  if (Number.isFinite(value)) {
    const abs = Math.abs(value);
    if (abs === 0) return 1;
    const halfMax = Number.MAX_VALUE / 2;
    return abs < halfMax ? abs * 2 : abs / 2;
  }
  return Number.MAX_VALUE;
}
