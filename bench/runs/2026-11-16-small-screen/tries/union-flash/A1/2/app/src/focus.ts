import type { ArcRotateCamera } from "@babylonjs/lite";

function neighbor(value: number, direction: number): number {
  const anyMath = Math as any;
  if (direction > 0 && typeof anyMath.nextUp === "function") {
    return anyMath.nextUp(value);
  }
  if (direction < 0 && typeof anyMath.nextDown === "function") {
    return anyMath.nextDown(value);
  }
  const delta = Math.max(1e-12, Math.abs(value) * Number.EPSILON * 4);
  return value + direction * delta;
}

function kickField(
  value: number,
  write: (value: number) => void,
  read: () => number,
  lower?: number,
  upper?: number,
  ignoreBounds = false,
  min?: number
): boolean {
  if (!Number.isFinite(value)) return false;

  const candidates: number[] = [];
  const addCandidate = (candidate: number): void => {
    if (!Number.isFinite(candidate) || candidate === value) return;
    if (min !== undefined && candidate < min) return;
    if (!ignoreBounds) {
      if (lower !== undefined && Number.isFinite(lower) && candidate <= lower) return;
      if (upper !== undefined && Number.isFinite(upper) && candidate >= upper) return;
    }
    candidates.push(candidate);
  };

  const baseDelta = Math.max(1e-12, Math.abs(value) * Number.EPSILON * 4);
  addCandidate(neighbor(value, 1));
  addCandidate(neighbor(value, -1));
  addCandidate(value + baseDelta);
  addCandidate(value - baseDelta);
  addCandidate(value + baseDelta * 4);
  addCandidate(value - baseDelta * 4);
  addCandidate(value + baseDelta * 16);
  addCandidate(value - baseDelta * 16);
  addCandidate(value + 1e-9);
  addCandidate(value - 1e-9);
  addCandidate(value + 1e-6);
  addCandidate(value - 1e-6);
  addCandidate(value + 1e-3);
  addCandidate(value - 1e-3);

  for (const candidate of candidates) {
    write(candidate);
    if (read() !== value) {
      write(value);
      return true;
    }
  }

  return false;
}

function insideBounds(value: number, lower?: number, upper?: number): boolean {
  if (!Number.isFinite(value)) return false;
  return (
    (lower === undefined || !Number.isFinite(lower) || value > lower) &&
    (upper === undefined || !Number.isFinite(upper) || value < upper)
  );
}

function nearZero(value: number): boolean {
  return Number.isFinite(value) && Math.abs(value) < 1e-12;
}

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  const alpha = camera.alpha;
  const beta = camera.beta;
  const radius = camera.radius;

  const target = camera.target;
  target.x = point.x;
  target.y = point.y;
  target.z = point.z;

  const writeRadius = (value: number) => { camera.radius = value; };
  const readRadius = () => camera.radius;
  const writeBeta = (value: number) => { camera.beta = value; };
  const readBeta = () => camera.beta;
  const writeAlpha = (value: number) => { camera.alpha = value; };
  const readAlpha = () => camera.alpha;

  const radiusInside = insideBounds(radius, camera.lowerRadiusLimit, camera.upperRadiusLimit);
  const betaInside = insideBounds(beta, camera.lowerBetaLimit, camera.upperBetaLimit);
  const alphaInside = insideBounds(alpha, camera.lowerAlphaLimit, camera.upperAlphaLimit);

  if (radiusInside && kickField(radius, writeRadius, readRadius, camera.lowerRadiusLimit, camera.upperRadiusLimit, false, 0)) return;
  if (betaInside && kickField(beta, writeBeta, readBeta, camera.lowerBetaLimit, camera.upperBetaLimit)) return;
  if (alphaInside && kickField(alpha, writeAlpha, readAlpha, camera.lowerAlphaLimit, camera.upperAlphaLimit)) return;

  const radiusSafe = nearZero(camera.inertialRadiusOffset);
  const betaSafe = nearZero(camera.inertialBetaOffset);
  const alphaSafe = nearZero(camera.inertialAlphaOffset);

  if (radiusSafe && kickField(radius, writeRadius, readRadius, camera.lowerRadiusLimit, camera.upperRadiusLimit, false, 0)) return;
  if (betaSafe && kickField(beta, writeBeta, readBeta, camera.lowerBetaLimit, camera.upperBetaLimit)) return;
  if (alphaSafe && kickField(alpha, writeAlpha, readAlpha, camera.lowerAlphaLimit, camera.upperAlphaLimit)) return;

  if (kickField(radius, writeRadius, readRadius, camera.lowerRadiusLimit, camera.upperRadiusLimit, true, 0)) return;
  if (kickField(beta, writeBeta, readBeta, camera.lowerBetaLimit, camera.upperBetaLimit, true)) return;
  if (kickField(alpha, writeAlpha, readAlpha, camera.lowerAlphaLimit, camera.upperAlphaLimit, true)) return;
}
