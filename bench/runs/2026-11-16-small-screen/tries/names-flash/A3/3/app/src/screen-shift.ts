import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

type Snapshot = {
  view: any;
  viewProjection: any;
  options: any;
};

function devicePixelRatio(): number {
  const g = globalThis as any;
  const dpr = g.devicePixelRatio;
  return Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
}

function canvasDimensions(canvas: HTMLCanvasElement) {
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const dpr = devicePixelRatio();

  const resolvedCssWidth =
    cssWidth > 0
      ? cssWidth
      : Math.max(1, Math.round((backingWidth > 0 ? backingWidth : 1) / dpr));

  const resolvedCssHeight =
    cssHeight > 0
      ? cssHeight
      : Math.max(1, Math.round((backingHeight > 0 ? backingHeight : 1) / dpr));

  const resolvedBackingWidth =
    backingWidth > 0
      ? backingWidth
      : Math.max(1, Math.round(resolvedCssWidth * dpr));

  const resolvedBackingHeight =
    backingHeight > 0
      ? backingHeight
      : Math.max(1, Math.round(resolvedCssHeight * dpr));

  return {
    cssWidth: resolvedCssWidth,
    cssHeight: resolvedCssHeight,
    backingWidth: resolvedBackingWidth,
    backingHeight: resolvedBackingHeight,
  };
}

function copyMatrix(source: any): any {
  if (typeof source?.clone === "function") {
    try {
      const cloned = source.clone();
      if (cloned !== source) return cloned;
    } catch {}
  }

  if (typeof source?.slice === "function") {
    try {
      const sliced = source.slice(0);
      if (sliced !== source) {
        if (ArrayBuffer.isView(sliced) || typeof sliced?.clone === "function") {
          return sliced;
        }
        return new Float32Array(sliced);
      }
    } catch {}
  }

  if (source instanceof Float32Array) return new Float32Array(source);
  if (Array.isArray(source)) return new Float32Array(source);

  if (source?.buffer instanceof ArrayBuffer) {
    try {
      const byteOffset = Number.isFinite(source.byteOffset) ? source.byteOffset : 0;
      const byteLength = Number.isFinite(source.byteLength) ? source.byteLength : 64;
      return new Float32Array(source.buffer.slice(byteOffset, byteOffset + byteLength));
    } catch {}
  }

  const rawArrays = [source?.array, source?.values, source?.elements];
  for (const raw of rawArrays) {
    if (raw instanceof Float32Array) return new Float32Array(raw);
    if (Array.isArray(raw)) return new Float32Array(raw);
  }

  if (typeof source?.copyTo === "function") {
    try {
      const out = new Float32Array(16);
      source.copyTo(out);
      return out;
    } catch {}
  }

  try {
    return new Float32Array(Array.from(source, Number));
  } catch {}

  const out = new Float32Array(16);
  for (let i = 0; i < 16; i++) {
    const value = typeof source?.get === "function" ? source.get(i) : source?.[i];
    const n = Number(value);
    out[i] = Number.isFinite(n) ? n : 0;
  }
  return out;
}

function copyVec(v: any): Vec {
  return {
    x: Number.isFinite(v?.x) ? v.x : 0,
    y: Number.isFinite(v?.y) ? v.y : 0,
    z: Number.isFinite(v?.z) ? v.z : 0,
  };
}

function floatingOrigin(camera: Camera): Vec | undefined {
  const c = camera as any;

  // The declarations expose _useFloatingOrigin but not a direct getter for the
  // origin. This is best-effort: use common internal names if present, then
  // fall back to the camera position.
  if (!c._useFloatingOrigin) return undefined;

  const candidates = [
    c._floatingOrigin,
    c.floatingOrigin,
    c._worldOrigin,
    c.worldOrigin,
    c._origin,
    c.origin,
  ];

  for (const candidate of candidates) {
    if (
      candidate &&
      Number.isFinite(candidate.x) &&
      Number.isFinite(candidate.y) &&
      Number.isFinite(candidate.z)
    ) {
      return copyVec(candidate);
    }
  }

  try {
    const pos = getCameraPosition(camera);
    if (
      pos &&
      Number.isFinite(pos.x) &&
      Number.isFinite(pos.y) &&
      Number.isFinite(pos.z)
    ) {
      return copyVec(pos);
    }
  } catch {}

  return undefined;
}

function snapshotFor(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
  const dims = canvasDimensions(canvas);

  const rawAspect = getEffectiveAspectRatio(
    camera,
    dims.backingWidth,
    dims.backingHeight,
  );
  const aspect =
    Number.isFinite(rawAspect) && rawAspect > 0
      ? rawAspect
      : dims.backingWidth / dims.backingHeight;

  const view = copyMatrix(getViewMatrix(camera));
  const viewProjection = copyMatrix(getViewProjectionMatrix(camera, aspect));

  let viewport = resolveCameraViewport(
    camera,
    dims.backingWidth,
    dims.backingHeight,
  ) as any;

  if (
    !viewport ||
    !Number.isFinite(viewport.width) ||
    viewport.width <= 0 ||
    !Number.isFinite(viewport.height) ||
    viewport.height <= 0
  ) {
    viewport = {
      x: 0,
      y: 0,
      width: dims.backingWidth,
      height: dims.backingHeight,
    };
  } else {
    viewport = {
      x: Number.isFinite(viewport.x) ? viewport.x : 0,
      y: Number.isFinite(viewport.y) ? viewport.y : 0,
      width: viewport.width,
      height: viewport.height,
    };
  }

  const options: any = {
    viewport,
    backingWidth: dims.backingWidth,
    backingHeight: dims.backingHeight,
    cssWidth: dims.cssWidth,
    cssHeight: dims.cssHeight,
  };

  const origin = floatingOrigin(camera);
  if (origin) options.worldOrigin = origin;

  return { view, viewProjection, options };
}

function screenPoint(snapshot: Snapshot, point: Vec) {
  try {
    const result = projectWorldToScreen(
      point as any,
      snapshot.view,
      snapshot.viewProjection,
      snapshot.options,
    ) as any;

    const valid =
      Boolean(result) &&
      Number.isFinite(result.cssX) &&
      Number.isFinite(result.cssY) &&
      Number.isFinite(result.clipW) &&
      result.clipW > 0 &&
      !result.behindCamera;

    return {
      x: result?.cssX ?? 0,
      y: result?.cssY ?? 0,
      valid,
    };
  } catch {
    return { x: 0, y: 0, valid: false };
  }
}

export function trackScreenShift(
  camera: Camera,
  canvas: HTMLCanvasElement,
): ShiftTracker {
  let previous = snapshotFor(camera, canvas);

  return {
    mark() {
      previous = snapshotFor(camera, canvas);
    },

    shift(point) {
      const current = snapshotFor(camera, canvas);
      const before = screenPoint(previous, point);
      const after = screenPoint(current, point);

      if (!before.valid || !after.valid) return { dx: 0, dy: 0 };

      const dx = after.x - before.x;
      const dy = after.y - before.y;

      if (!Number.isFinite(dx) || !Number.isFinite(dy)) return { dx: 0, dy: 0 };

      return { dx, dy };
    },
  };
}
