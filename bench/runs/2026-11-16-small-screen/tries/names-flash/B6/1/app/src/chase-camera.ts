import type { FreeCamera } from "@babylonjs/lite";
import * as BabylonLite from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ChaseCamera {
  camera: FreeCamera;
  bank(up: Vec): void;
}

const EPS = 1e-12;

function safeProperty(obj: any, key: string): any {
  try {
    return obj?.[key];
  } catch (_e) {
    void _e;
    return undefined;
  }
}

function finiteNumber(value: unknown): number {
  const n = Number(value);
  return isFinite(n) ? n : 0;
}

function asVec(value: unknown): Vec {
  if (!value || typeof value !== "object") return { x: 0, y: 0, z: 0 };

  const obj = value as any;
  const valueVector = safeProperty(obj, "value");
  const inner = valueVector && typeof valueVector === "object" ? valueVector : obj;

  return {
    x: finiteNumber(safeProperty(inner, "x")),
    y: finiteNumber(safeProperty(inner, "y")),
    z: finiteNumber(safeProperty(inner, "z")),
  };
}

function cloneVec(v: Vec): Vec {
  return { x: v.x, y: v.y, z: v.z };
}

function length(v: Vec): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function normalize(v: Vec): Vec | null {
  const len = length(v);
  if (!isFinite(len) || len < EPS) return null;

  const inv = 1 / len;
  const x = v.x * inv;
  const y = v.y * inv;
  const z = v.z * inv;

  if (!isFinite(x) || !isFinite(y) || !isFinite(z)) return null;
  return { x, y, z };
}

function subtract(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(v: Vec, s: number): Vec {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function dot(a: Vec, b: Vec): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function closestPerp(v: Vec, n: Vec): Vec | null {
  const d = dot(v, n);
  return normalize(subtract(v, scale(n, d)));
}

function sameDirection(a: Vec, b: Vec): boolean {
  return dot(a, b) >= 1 - EPS;
}

function arbitraryPerp(n: Vec): Vec {
  const candidates: Vec[] = [
    { x: 0, y: 0, z: 1 },
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
  ];

  for (const candidate of candidates) {
    const perpendicular = closestPerp(candidate, n);
    if (perpendicular) return perpendicular;
  }

  return { x: 0, y: 0, z: 1 };
}

function tryCall(obj: any, name: string, args: any[]): boolean {
  const fn = safeProperty(obj, name);
  if (typeof fn !== "function") return false;

  try {
    fn.apply(obj, args);
    return true;
  } catch (_e) {
    void _e;
    return false;
  }
}

function callNoArg(obj: any, name: string): boolean {
  const fn = safeProperty(obj, name);
  if (typeof fn !== "function") return false;

  try {
    fn.call(obj);
    return true;
  } catch (_e) {
    void _e;
    return false;
  }
}

function assignFields(obj: any, v: Vec): void {
  if (!obj) return;

  try {
    obj.x = v.x;
    obj.y = v.y;
    obj.z = v.z;
  } catch (_e) {
    void _e;
  }
}

function setVector(vec: any, v: Vec): void {
  if (!vec) return;

  if (tryCall(vec, "set", [v.x, v.y, v.z])) return;
  if (tryCall(vec, "copyFromFloats", [v.x, v.y, v.z])) return;
  if (tryCall(vec, "copyFrom", [v])) return;

  let hasDirectVectorFields = false;
  try {
    hasDirectVectorFields = typeof vec === "object" && ("x" in vec || typeof safeProperty(vec, "x") === "number");
  } catch (_e) {
    void _e;
  }

  if (hasDirectVectorFields) assignFields(vec, v);

  const value = safeProperty(vec, "value");
  if (value && typeof value === "object") {
    if (
      !tryCall(value, "set", [v.x, v.y, v.z]) &&
      !tryCall(value, "copyFromFloats", [v.x, v.y, v.z]) &&
      !tryCall(value, "copyFrom", [v])
    ) {
      assignFields(value, v);
    }
  }
}

function notifyObservable(obj: any): void {
  if (!obj) return;

  const names = [
    "markModified",
    "_markModified",
    "update",
    "notify",
    "notifyObservers",
  ];

  for (const name of names) callNoArg(obj, name);

  const value = safeProperty(obj, "value");
  if (value && typeof value === "object") {
    for (const name of names) callNoArg(value, name);
  }
}

function setCameraUp(camera: any, v: Vec): void {
  const upVector = safeProperty(camera, "upVector");

  if (upVector) {
    setVector(upVector, v);
    notifyObservable(upVector);
  } else {
    const fallback =
      safeProperty(camera, "_up") ??
      safeProperty(camera, "up") ??
      safeProperty(camera, "_upVector");

    if (fallback) {
      setVector(fallback, v);
      notifyObservable(fallback);
    }
  }

  const viewVer = safeProperty(camera, "_viewVer");
  if (typeof viewVer === "number") {
    try {
      (camera as any)._viewVer = viewVer + 1;
    } catch (_e) {
      void _e;
    }
  }
}

function getForward(camera: any): Vec | null {
  const position = asVec(safeProperty(camera, "position"));
  const target = asVec(safeProperty(camera, "target"));
  return normalize(subtract(target, position));
}

function preservePreviousRoll(camera: any, fallbackUp: Vec | null, forward: Vec): Vec | null {
  const rawCurrent = asVec(safeProperty(camera, "upVector"));
  const currentLength = length(rawCurrent);
  const currentUp = normalize(rawCurrent) ?? fallbackUp;

  if (!currentUp) return fallbackUp;

  const preserved = closestPerp(currentUp, forward);
  if (!preserved) return fallbackUp;

  const needsUpdate = !sameDirection(preserved, currentUp) || Math.abs(currentLength - 1) > EPS;
  if (needsUpdate) setCameraUp(camera, preserved);

  return preserved;
}

function pickCameraFactory(): any {
  const namespace = BabylonLite as any;
  const sources = [namespace, safeProperty(namespace, "default")];
  const names = ["createBankedFreeCamera", "_createFreeCamera", "createFreeCamera"];

  for (const source of sources) {
    for (const name of names) {
      const fn = safeProperty(source, name);
      if (typeof fn === "function") return fn;
    }
  }

  return undefined;
}

export function createChaseCamera(eye: Vec, target: Vec): ChaseCamera {
  const position = asVec(eye);
  const targetVec = asVec(target);
  const initialForward = normalize(subtract(targetVec, position));

  const upright = { x: 0, y: 1, z: 0 };
  let initialUp: Vec | null = initialForward ? closestPerp(upright, initialForward) : null;
  if (!initialUp) initialUp = initialForward ? arbitraryPerp(initialForward) : upright;

  const startUp = initialUp ?? upright;

  const factory = pickCameraFactory();
  if (typeof factory !== "function") {
    throw new Error("Could not find a Babylon Lite camera factory.");
  }

  const banked = factory(
    cloneVec(position) as any,
    cloneVec(targetVec) as any,
    cloneVec(startUp) as any
  ) as any;

  if (!banked) {
    throw new Error("Babylon Lite camera factory returned no camera.");
  }

  const camera = banked as FreeCamera;

  setCameraUp(banked, startUp);
  let previousUp: Vec | null =
    normalize(asVec(safeProperty(banked, "upVector"))) ??
    normalize(startUp) ??
    startUp;

  const bank = (up: Vec): void => {
    const desired = normalize(asVec(up));
    if (!desired) return;

    const forward = getForward(banked);
    if (!forward) return;

    const parallelness = dot(desired, forward);

    // If the car's up is exactly along the line of sight, the roll is undefined
    // for that input. Keep the camera's previous/current roll instead.
    if (Math.abs(parallelness) >= 1 - EPS) {
      previousUp = preservePreviousRoll(banked, previousUp, forward) ?? previousUp;
      return;
    }

    const newUp = closestPerp(desired, forward);
    if (!newUp) {
      previousUp = preservePreviousRoll(banked, previousUp, forward) ?? previousUp;
      return;
    }

    setCameraUp(banked, newUp);
    previousUp = newUp;
  };

  return { camera, bank };
}
