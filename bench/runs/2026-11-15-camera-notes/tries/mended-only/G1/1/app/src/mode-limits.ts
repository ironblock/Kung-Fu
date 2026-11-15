import type { GeospatialCamera, GeospatialLimits } from "@babylonjs/lite";

// ASSUMPTIONS. The library is not on this machine, so none of these were checked:
// - GeospatialLimits has radiusMin/radiusMax (zoom) and yawMin/yawMax (heading).
//   A missing or null bound means unbounded. Yaw with no bounds means [-PI, PI).
// - camera.radius and camera.yaw are property accessors (own or inherited). The
//   clamp is installed as an accessor on the camera instance, so direct writes and
//   any library writes that go through those properties are clamped.
//   Writes that bypass them (private fields, methods such as
//   setGeospatialOrientation or flyGeospatialCameraToAsync) are NOT clamped here.
// - camera.limits is a writable property. It receives a shallow copy of the mode's
//   limits, so the app's mode object is never written to.

interface RangeFields {
  radiusMin?: number | null;
  radiusMax?: number | null;
  yawMin?: number | null;
  yawMax?: number | null;
}

interface Range {
  min: number;
  max: number;
}

interface Ranges {
  radius: Range;
  yaw: Range;
}

interface Entry {
  ranges: Ranges;
}

type ClampedKey = "radius" | "yaw";

const TAU = 2 * Math.PI;

// One entry per camera. Its ranges are replaced on every mode switch, and the
// accessors installed on the camera read them live.
const entries = new WeakMap<object, Entry>();

function readRanges(limits: GeospatialLimits): Ranges {
  const f = limits as unknown as RangeFields;
  const radius: Range = {
    min: f.radiusMin ?? -Infinity,
    max: f.radiusMax ?? Infinity,
  };
  const yaw: Range = {
    min: f.yawMin ?? -Math.PI,
    max: f.yawMax ?? Math.PI,
  };
  if (!(radius.min <= radius.max)) {
    throw new RangeError("radiusMin is greater than radiusMax");
  }
  if (!(yaw.min <= yaw.max)) {
    throw new RangeError(
      "yawMin is greater than yawMax (a heading range that wraps past PI is not supported)",
    );
  }
  return { radius, yaw };
}

function clamp(v: number, r: Range): number {
  return Math.min(r.max, Math.max(r.min, v));
}

// Yaw is stored in [-PI, PI). Bring a written value into that span first, so the
// range is applied to the value that will actually be stored.
function wrapYaw(v: number): number {
  return v - TAU * Math.floor((v + Math.PI) / TAU);
}

function findDescriptor(obj: object, key: string): PropertyDescriptor | undefined {
  for (let o: object | null = obj; o; o = Object.getPrototypeOf(o)) {
    const d = Object.getOwnPropertyDescriptor(o, key);
    if (d) return d;
  }
  return undefined;
}

function installClamp(camera: GeospatialCamera, key: ClampedKey, entry: Entry): void {
  const desc = findDescriptor(camera, key);
  if (!desc) {
    throw new Error(`GeospatialCamera has no "${key}" property`);
  }

  let readBase: () => number;
  let writeBase: (v: number) => void;
  if (desc.get || desc.set) {
    const get = desc.get;
    const set = desc.set;
    readBase = () => (get ? (get.call(camera) as number) : (undefined as unknown as number));
    writeBase = (v) => {
      if (!set) throw new TypeError(`"${key}" is read-only`);
      set.call(camera, v);
    };
  } else {
    let slot = desc.value as number;
    readBase = () => slot;
    writeBase = (v) => {
      slot = v;
    };
  }

  Object.defineProperty(camera, key, {
    configurable: true,
    enumerable: true,
    get: readBase,
    set(v: number) {
      const r = entry.ranges[key];
      writeBase(clamp(key === "yaw" ? wrapYaw(v) : v, r));
    },
  });
}

/**
 * Applies one map mode's zoom (radius) and heading (yaw) ranges to the camera.
 * Later writes to radius or yaw are kept inside these ranges, and camera.limits
 * reports them. Calling it again with another mode's limits switches to that mode.
 * The limits object passed in is only read, never modified.
 */
export function useModeLimits(camera: GeospatialCamera, limits: GeospatialLimits): void {
  const ranges = readRanges(limits);

  let entry = entries.get(camera);
  if (!entry) {
    const fresh: Entry = { ranges };
    installClamp(camera, "radius", fresh);
    installClamp(camera, "yaw", fresh);
    entries.set(camera, fresh);
    entry = fresh;
  } else {
    entry.ranges = ranges;
  }

  // A shallow copy, so the library cannot write into the app's mode object.
  (camera as unknown as { limits: GeospatialLimits }).limits = { ...limits };

  // Write the current values back through the clamp, so they fall inside this mode's ranges.
  const radius = camera.radius;
  camera.radius = radius;
  const yaw = camera.yaw;
  camera.yaw = yaw;
}
