import type { ArcRotateCamera } from "@babylonjs/lite";

type PoseField = "alpha" | "beta" | "radius";

export function focusOn(camera: ArcRotateCamera, point: { x: number; y: number; z: number }): void {
  const target = camera.target;
  target.x = point.x;
  target.y = point.y;
  target.z = point.z;

  // Babylon Lite does not dirty an ArcRotateCamera when target.x/y/z changes.
  // A value-changing write to alpha/beta/radius does. Make one such write,
  // then restore the original value so the final pose is unchanged.
  const clampActive = typeof camera._clampToLimits === "function";
  const EPS = 2.220446049250313e-16;

  const getLimits = (field: PoseField): { low?: number; high?: number } => {
    if (field === "alpha") {
      return { low: camera.lowerAlphaLimit, high: camera.upperAlphaLimit };
    }
    if (field === "beta") {
      return { low: camera.lowerBetaLimit, high: camera.upperBetaLimit };
    }
    return { low: camera.lowerRadiusLimit, high: camera.upperRadiusLimit };
  };

  const nudgeAndRestore = (field: PoseField, direction: 1 | -1): boolean => {
    const old = camera[field];
    if (!Number.isFinite(old)) return false;

    let delta = Math.max(1e-6, Math.abs(old) * EPS * 10);
    const limits = clampActive ? getLimits(field) : { low: undefined, high: undefined };
    const low = limits.low;
    const high = limits.high;

    if (direction === 1) {
      if (high !== undefined) {
        const space = high - old;
        if (space <= 0) return false;
        delta = Math.min(delta, space * 0.5);
      }
    } else {
      if (low !== undefined) {
        const space = old - low;
        if (space <= 0) return false;
        delta = Math.min(delta, space * 0.5);
      }
    }

    if (field === "radius" && direction === -1) {
      const maxDelta = old * 0.5;
      if (maxDelta <= 0) return false;
      delta = Math.min(delta, maxDelta);
    }

    if (!Number.isFinite(delta) || delta <= 0) return false;

    const candidate = direction === 1 ? old + delta : old - delta;
    if (!Number.isFinite(candidate) || candidate === old) return false;
    if (field === "radius" && candidate < 0) return false;
    if (field === "beta" && old >= 0 && old <= Math.PI && (candidate < 0 || candidate > Math.PI)) {
      return false;
    }
    if ((low !== undefined && candidate === low) || (high !== undefined && candidate === high)) {
      return false;
    }

    camera[field] = candidate;
    const applied = camera[field];
    if (!Number.isFinite(applied) || applied === old) return false;
    if ((low !== undefined && applied === low) || (high !== undefined && applied === high)) {
      camera[field] = old;
      return false;
    }

    camera[field] = old;
    return camera[field] === old;
  };

  const fields: PoseField[] = ["radius", "alpha", "beta"];
  for (const field of fields) {
    if (nudgeAndRestore(field, 1) || nudgeAndRestore(field, -1)) {
      return;
    }
  }
}
