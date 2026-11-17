import type { ArcRotateCamera } from "@babylonjs/lite";

/*
 * Babylon Lite's arc-rotate camera does not mark itself dirty when
 * camera.target.x/y/z are written in place. The new target is picked up by
 * the next alpha/beta/radius write that actually changes a value. So we write
 * the target in place, then force a tiny alpha change and restore it.
 *
 * We temporarily remove any defined limit fields around that alpha write so
 * the forced nudge cannot be clamped into place or otherwise changed by
 * setCameraLimits behavior. We restore the limits before returning.
 */

function nudge(value: number): number {
  if (Number.isFinite(value)) {
    const delta = Math.max(1e-7, Math.abs(value) * 1e-7);

    // Prefer moving away from +/-Infinity so the temporary value stays finite.
    const away = value >= 0 ? value - delta : value + delta;
    if (away !== value && Number.isFinite(away)) return away;

    const other = value >= 0 ? value + delta : value - delta;
    if (other !== value && Number.isFinite(other)) return other;

    return value === 0 ? 1e-7 : value * 2;
  }

  if (value === Number.POSITIVE_INFINITY) return Number.MAX_VALUE;
  if (value === Number.NEGATIVE_INFINITY) return -Number.MAX_VALUE;

  // For NaN we just pick something else; the real camera should be finite.
  return Number.MAX_VALUE;
}

export function focusOn(
  camera: ArcRotateCamera,
  point: { x: number; y: number; z: number },
): void {
  const x = point.x;
  const y = point.y;
  const z = point.z;

  // Keep the existing target object and mutate it in place.
  const target = camera.target;
  target.x = x;
  target.y = y;
  target.z = z;

  const savedAlpha = camera.alpha;

  const savedLowerAlpha = camera.lowerAlphaLimit;
  const savedUpperAlpha = camera.upperAlphaLimit;
  const savedLowerBeta = camera.lowerBetaLimit;
  const savedUpperBeta = camera.upperBetaLimit;
  const savedLowerRadius = camera.lowerRadiusLimit;
  const savedUpperRadius = camera.upperRadiusLimit;

  const hadLimits =
    savedLowerAlpha !== undefined ||
    savedUpperAlpha !== undefined ||
    savedLowerBeta !== undefined ||
    savedUpperBeta !== undefined ||
    savedLowerRadius !== undefined ||
    savedUpperRadius !== undefined;

  if (hadLimits) {
    if (savedLowerAlpha !== undefined) camera.lowerAlphaLimit = undefined;
    if (savedUpperAlpha !== undefined) camera.upperAlphaLimit = undefined;
    if (savedLowerBeta !== undefined) camera.lowerBetaLimit = undefined;
    if (savedUpperBeta !== undefined) camera.upperBetaLimit = undefined;
    if (savedLowerRadius !== undefined) camera.lowerRadiusLimit = undefined;
    if (savedUpperRadius !== undefined) camera.upperRadiusLimit = undefined;
  }

  // This two-step write changes alpha twice, so the camera becomes dirty and
  // the new target is used immediately, while the final alpha is unchanged.
  const tempAlpha = nudge(savedAlpha);
  camera.alpha = tempAlpha;
  camera.alpha = savedAlpha;

  // Force the camera's world matrix getter to refresh before returning.
  void camera.worldMatrix;

  if (hadLimits) {
    if (savedLowerAlpha !== undefined) camera.lowerAlphaLimit = savedLowerAlpha;
    if (savedUpperAlpha !== undefined) camera.upperAlphaLimit = savedUpperAlpha;
    if (savedLowerBeta !== undefined) camera.lowerBetaLimit = savedLowerBeta;
    if (savedUpperBeta !== undefined) camera.upperBetaLimit = savedUpperBeta;
    if (savedLowerRadius !== undefined) camera.lowerRadiusLimit = savedLowerRadius;
    if (savedUpperRadius !== undefined) camera.upperRadiusLimit = savedUpperRadius;
  }
}
