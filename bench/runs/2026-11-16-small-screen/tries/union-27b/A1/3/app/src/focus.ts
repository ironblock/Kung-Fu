import type { ArcRotateCamera } from "@babylonjs/lite";
import { setCameraLimits } from "@babylonjs/lite";

type Point = { x: number; y: number; z: number };
type Channel = "alpha" | "beta" | "radius";

const CHANNELS: readonly Channel[] = ["alpha", "beta", "radius"];
const WIDE = 1e308;

function lowerLimit(camera: ArcRotateCamera, channel: Channel): number | undefined {
  switch (channel) {
    case "alpha":
      return camera.lowerAlphaLimit;
    case "beta":
      return camera.lowerBetaLimit;
    case "radius":
      return camera.lowerRadiusLimit;
    default:
      return undefined;
  }
}

function upperLimit(camera: ArcRotateCamera, channel: Channel): number | undefined {
  switch (channel) {
    case "alpha":
      return camera.upperAlphaLimit;
    case "beta":
      return camera.upperBetaLimit;
    case "radius":
      return camera.upperRadiusLimit;
    default:
      return undefined;
  }
}

function setChannelLimits(
  camera: ArcRotateCamera,
  channel: Channel,
  lower: number | undefined,
  upper: number | undefined
): void {
  switch (channel) {
    case "alpha":
      setCameraLimits(camera, { lowerAlphaLimit: lower, upperAlphaLimit: upper });
      break;
    case "beta":
      setCameraLimits(camera, { lowerBetaLimit: lower, upperBetaLimit: upper });
      break;
    case "radius":
      setCameraLimits(camera, { lowerRadiusLimit: lower, upperRadiusLimit: upper });
      break;
    default:
      break;
  }
}

function stepFor(value: number): number {
  if (!Number.isFinite(value)) return 1e-7;
  return Math.max(1e-7, Math.abs(value) * Number.EPSILON);
}

function tryDirection(camera: ArcRotateCamera, channel: Channel, direction: 1 | -1): boolean {
  const value = camera[channel];
  if (!Number.isFinite(value)) return false;

  const base = stepFor(value);
  let step = base;

  if (direction === 1) {
    const upper = upperLimit(camera, channel);
    if (Number.isFinite(upper)) {
      const headroom = upper - value;
      if (headroom <= 0) return false;
      if (headroom < base) step = headroom * 0.5;
    }
  } else {
    const lower = lowerLimit(camera, channel);
    if (Number.isFinite(lower)) {
      const headroom = value - lower;
      if (headroom <= 0) return false;
      if (headroom < base) step = headroom * 0.5;
    }
  }

  if (!Number.isFinite(step) || step <= 0) return false;

  let candidate = value + direction * step;
  if (candidate === value) {
    candidate = value + direction * base;
    if (candidate === value) return false;
  }

  camera[channel] = candidate;
  const after = camera[channel];
  camera[channel] = value;
  return after !== value && camera[channel] === value;
}

function tryPlainNudge(camera: ArcRotateCamera, channel: Channel): boolean {
  const value = camera[channel];
  if (!Number.isFinite(value)) return false;

  const step = stepFor(value);
  for (const direction of [1, -1] as const) {
    camera[channel] = value + direction * step;
    const after = camera[channel];
    camera[channel] = value;
    if (after !== value && camera[channel] === value) return true;
  }
  return false;
}

function tryNudge(camera: ArcRotateCamera, channel: Channel): boolean {
  return (
    tryDirection(camera, channel, 1) ||
    tryDirection(camera, channel, -1) ||
    tryPlainNudge(camera, channel)
  );
}

function forceRefresh(camera: ArcRotateCamera): void {
  for (const channel of CHANNELS) {
    if (tryNudge(camera, channel)) return;
  }

  // If every channel is locked to a single value, no ordinary write can change
  // it. Temporarily widen one channel, make a real changing write, then restore.
  for (const channel of CHANNELS) {
    const value = camera[channel];
    if (!Number.isFinite(value)) continue;

    const lower = lowerLimit(camera, channel);
    const upper = upperLimit(camera, channel);

    setChannelLimits(camera, channel, -WIDE, WIDE);
    const step = stepFor(value);
    camera[channel] = value + step;
    camera[channel] = value;
    setChannelLimits(camera, channel, lower, upper);
    return;
  }
}

export function focusOn(camera: ArcRotateCamera, point: Point): void {
  const target = camera.target;
  target.x = point.x;
  target.y = point.y;
  target.z = point.z;

  forceRefresh(camera);
}
