import type { ArcRotateCamera } from "@babylonjs/lite";

function pokeChannel(
  camera: ArcRotateCamera,
  channel: "alpha" | "beta" | "radius",
  allowAtBound: boolean,
): boolean {
  const value = camera[channel];
  if (!Number.isFinite(value)) {
    return false;
  }

  const lower =
    channel === "alpha"
      ? camera.lowerAlphaLimit
      : channel === "beta"
        ? camera.lowerBetaLimit
        : camera.lowerRadiusLimit;
  const upper =
    channel === "alpha"
      ? camera.upperAlphaLimit
      : channel === "beta"
        ? camera.upperBetaLimit
        : camera.upperRadiusLimit;

  const clamped = typeof camera._clampToLimits === "function";
  if (clamped) {
    if ((lower !== undefined && value < lower) || (upper !== undefined && value > upper)) {
      return false;
    }
    if (!allowAtBound) {
      if ((lower !== undefined && value === lower) || (upper !== undefined && value === upper)) {
        return false;
      }
    }
  }

  const eps = Math.max(1e-7, Math.abs(value) * 1e-12);
  const candidates: number[] = [];

  const add = (v: number): void => {
    if (!Number.isFinite(v) || v === value) {
      return;
    }
    if (lower !== undefined && v <= lower) {
      return;
    }
    if (upper !== undefined && v >= upper) {
      return;
    }
    candidates.push(v);
  };

  if (lower !== undefined && upper !== undefined && upper > lower) {
    if (value < upper) {
      add((value + upper) / 2);
    }
    if (value > lower) {
      add((value + lower) / 2);
    }
    add((lower + upper) / 2);
    add(value + eps);
    add(value - eps);
  } else if (upper !== undefined) {
    if (value < upper) {
      add((value + upper) / 2);
    }
    add(value - eps);
    add(value - Math.max(1, eps));
  } else if (lower !== undefined) {
    if (value > lower) {
      add((value + lower) / 2);
    }
    add(value + eps);
    add(value + Math.max(1, eps));
  } else {
    add(value + eps);
    add(value - eps);
    add(value + Math.max(1, eps));
    add(value - Math.max(1, eps));
  }

  for (const candidate of candidates) {
    camera[channel] = candidate;
    if (camera[channel] !== value) {
      camera[channel] = value;
      return true;
    }
  }

  return false;
}

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  const target = camera.target;
  target.x = point.x;
  target.y = point.y;
  target.z = point.z;

  const channels = ["alpha", "beta", "radius"] as const;

  for (const allowAtBound of [false, true] as const) {
    for (const channel of channels) {
      if (pokeChannel(camera, channel, allowAtBound)) {
        return;
      }
    }
  }

  camera._viewVer = -1;
  camera._projVer = -1;
  camera._vpVer = -1;
}
