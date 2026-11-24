import type { Camera } from "@babylonjs/lite";
import * as BabylonLite from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

type ViewportLike = { x: number; y: number; width: number; height: number };
type ScreenPoint = { cssX: number; cssY: number };

type ProjectPoint = Parameters<typeof BabylonLite.projectWorldToScreen>[0];
type ProjectView = Parameters<typeof BabylonLite.projectWorldToScreen>[1];
type ProjectViewProjection = Parameters<typeof BabylonLite.projectWorldToScreen>[2];
type ProjectOptions = Parameters<typeof BabylonLite.projectWorldToScreen>[3];

interface Snapshot {
  view: ProjectView;
  viewProjection: ProjectViewProjection;
  viewport: ViewportLike;
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
  worldOrigin?: Vec;
}

function positiveFinite(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function copyMatrix(source: unknown): unknown {
  if (typeof source !== "object" || source === null) return source;

  const cloner = source as { clone?: () => unknown; copy?: () => unknown };
  if (typeof cloner.clone === "function") {
    try {
      const clone = cloner.clone();
      if (clone !== source && clone !== undefined && clone !== null) return clone;
    } catch {
      // fall through
    }
  }
  if (typeof cloner.copy === "function") {
    try {
      const clone = cloner.copy();
      if (clone !== source && clone !== undefined && clone !== null) return clone;
    } catch {
      // fall through
    }
  }

  const arrayLike = source as ArrayLike<number>;
  if (typeof arrayLike.length === "number" && Number.isFinite(arrayLike.length)) {
    if (arrayLike.length >= 16) {
      const out = new Float32Array(16);
      for (let i = 0; i < 16; i++) {
        const v = arrayLike[i];
        out[i] = typeof v === "number" ? v : Number(v);
      }
      return out;
    }
    return undefined;
  }

  const storage = source as { buffer?: ArrayBufferLike; byteOffset?: number; byteLength?: number };
  if (storage.buffer && typeof storage.byteLength === "number" && Number.isFinite(storage.byteLength)) {
    const byteOffset = typeof storage.byteOffset === "number" && Number.isFinite(storage.byteOffset)
      ? storage.byteOffset
      : 0;

    if (storage.buffer.byteLength >= byteOffset + 64) {
      try {
        const view = new Float32Array(storage.buffer, byteOffset, 16);
        const out = new Float32Array(16);
        out.set(view);
        return out;
      } catch {
        // fall through
      }
    }
  }

  const container = source as {
    matrix?: ArrayLike<number>;
    values?: ArrayLike<number>;
    elements?: ArrayLike<number>;
    m?: ArrayLike<number>;
  };
  const values = container.matrix ?? container.values ?? container.elements ?? container.m;
  if (values && typeof values.length === "number" && Number.isFinite(values.length)) {
    if (values.length >= 16) {
      const out = new Float32Array(16);
      for (let i = 0; i < 16; i++) {
        const v = values[i];
        out[i] = typeof v === "number" ? v : Number(v);
      }
      return out;
    }
    return undefined;
  }

  const proto = Object.getPrototypeOf(source);
  const cloneFunction = (globalThis as { structuredClone?: (value: unknown) => unknown }).structuredClone;
  if ((proto === Object.prototype || proto === null) && typeof cloneFunction === "function") {
    try {
      const cloned = cloneFunction(source);
      if (cloned !== undefined) return cloned;
    } catch {
      // fall through
    }
  }

  return source;
}

function copyViewport(source: unknown): ViewportLike {
  const v = source as Partial<ViewportLike> | null | undefined;
  return {
    x: Number(v?.x ?? 0),
    y: Number(v?.y ?? 0),
    width: Number(v?.width ?? 0),
    height: Number(v?.height ?? 0),
  };
}

function copyVec3(source: unknown): Vec | undefined {
  const v = source as Partial<Vec> | null | undefined;
  if (!v || typeof v.x !== "number" || typeof v.y !== "number" || typeof v.z !== "number") return undefined;
  return { x: v.x, y: v.y, z: v.z };
}

function canvasGeometry(canvas: HTMLCanvasElement) {
  const dprRaw = typeof window !== "undefined" && typeof window.devicePixelRatio === "number"
    ? window.devicePixelRatio
    : 1;
  const dpr = positiveFinite(dprRaw, 1);

  const cssWidth = positiveFinite(canvas.clientWidth || canvas.offsetWidth || canvas.width || 1, 1);
  const cssHeight = positiveFinite(canvas.clientHeight || canvas.offsetHeight || canvas.height || 1, 1);

  const backingWidth = positiveFinite(
    canvas.width || Math.round(cssWidth * dpr),
    Math.max(1, Math.round(cssWidth * dpr)),
  );
  const backingHeight = positiveFinite(
    canvas.height || Math.round(cssHeight * dpr),
    Math.max(1, Math.round(cssHeight * dpr)),
  );

  return { cssWidth, cssHeight, backingWidth, backingHeight };
}

function project(snapshot: Snapshot, point: Vec): ScreenPoint | null {
  try {
    const worldPoint = { x: point.x, y: point.y, z: point.z } as ProjectPoint;
    const options = {
      viewport: snapshot.viewport,
      backingWidth: snapshot.backingWidth,
      backingHeight: snapshot.backingHeight,
      cssWidth: snapshot.cssWidth,
      cssHeight: snapshot.cssHeight,
      worldOrigin: snapshot.worldOrigin,
    } as ProjectOptions;

    const result = BabylonLite.projectWorldToScreen(
      worldPoint,
      snapshot.view,
      snapshot.viewProjection,
      options,
    );

    if (!result) return null;
    if (result.behindCamera) return null;
    if (!Number.isFinite(result.cssX) || !Number.isFinite(result.cssY)) return null;

    return { cssX: result.cssX, cssY: result.cssY };
  } catch {
    return null;
  }
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  const capture = (): Snapshot => {
    const geometry = canvasGeometry(canvas);

    let viewport: ViewportLike;
    try {
      viewport = copyViewport(
        BabylonLite.resolveCameraViewport(camera, geometry.backingWidth, geometry.backingHeight),
      );
    } catch {
      viewport = { x: 0, y: 0, width: geometry.backingWidth, height: geometry.backingHeight };
    }

    if (!Number.isFinite(viewport.x)) viewport.x = 0;
    if (!Number.isFinite(viewport.y)) viewport.y = 0;
    viewport.width = positiveFinite(viewport.width, geometry.backingWidth);
    viewport.height = positiveFinite(viewport.height, geometry.backingHeight);

    let aspect = viewport.width / viewport.height;
    try {
      aspect = BabylonLite.getEffectiveAspectRatio(camera, geometry.backingWidth, geometry.backingHeight);
    } catch {
      // use viewport fallback
    }
    if (!Number.isFinite(aspect) || aspect <= 0) aspect = viewport.width / viewport.height;

    let rawView: unknown;
    try {
      rawView = copyMatrix(BabylonLite.getViewMatrix(camera));
    } catch {
      rawView = undefined;
    }
    if (rawView == null) {
      try {
        rawView = copyMatrix(camera._viewCache);
      } catch {
        rawView = undefined;
      }
    }
    const view = (rawView ?? new Float32Array(16)) as unknown as ProjectView;

    let rawViewProjection: unknown;
    try {
      rawViewProjection = copyMatrix(BabylonLite.getViewProjectionMatrix(camera, aspect));
    } catch {
      rawViewProjection = undefined;
    }
    if (rawViewProjection == null) {
      try {
        rawViewProjection = copyMatrix(camera._vpCache);
      } catch {
        rawViewProjection = undefined;
      }
    }
    const viewProjection = (rawViewProjection ?? new Float32Array(16)) as unknown as ProjectViewProjection;

    let worldOrigin: Vec | undefined;
    try {
      if (camera._useFloatingOrigin) {
        worldOrigin = copyVec3(BabylonLite.getCameraPosition(camera));
      }
    } catch {
      worldOrigin = undefined;
    }

    return {
      view,
      viewProjection,
      viewport,
      backingWidth: geometry.backingWidth,
      backingHeight: geometry.backingHeight,
      cssWidth: geometry.cssWidth,
      cssHeight: geometry.cssHeight,
      worldOrigin,
    };
  };

  let snapshot: Snapshot | null = null;
  try {
    snapshot = capture();
  } catch {
    snapshot = null;
  }

  return {
    mark() {
      try {
        snapshot = capture();
      } catch {
        // keep the previous snapshot if re-marking failed
      }
    },

    shift(point) {
      if (!snapshot) return { dx: 0, dy: 0 };

      let current: Snapshot | null = null;
      try {
        current = capture();
      } catch {
        return { dx: 0, dy: 0 };
      }

      const before = project(snapshot, point);
      const after = project(current, point);

      if (!before || !after) return { dx: 0, dy: 0 };

      const dx = after.cssX - before.cssX;
      const dy = after.cssY - before.cssY;

      if (!Number.isFinite(dx) || !Number.isFinite(dy)) return { dx: 0, dy: 0 };
      return { dx, dy };
    },
  };
}
