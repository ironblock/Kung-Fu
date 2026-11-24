import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreenToRef,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

type Matrix = Float32Array;

type PixelViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ProjectOptions = {
  viewport: PixelViewport;
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
  worldOrigin?: Vec;
};

type ProjectedPoint = {
  x: number;
  y: number;
  z: number;
  cssX: number;
  cssY: number;
  clipW: number;
  behindCamera: boolean;
  clipped: boolean;
  offscreen: boolean;
};

type Snapshot = {
  view: Matrix;
  viewProjection: Matrix;
  viewport: PixelViewport;
  options: ProjectOptions;
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
  worldOrigin?: Vec;
};

const projectToRef = projectWorldToScreenToRef as unknown as (
  point: Vec,
  view: Matrix,
  viewProjection: Matrix,
  options: ProjectOptions,
  result: ProjectedPoint
) => ProjectedPoint;

function positiveRound(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.max(1, Math.round(value)) : 0;
}

function readCanvasSizes(canvas: HTMLCanvasElement) {
  const cssWidth =
    positiveRound(canvas.clientWidth) ||
    positiveRound(canvas.offsetWidth) ||
    positiveRound(canvas.width) ||
    1;

  const cssHeight =
    positiveRound(canvas.clientHeight) ||
    positiveRound(canvas.offsetHeight) ||
    positiveRound(canvas.height) ||
    1;

  const backingWidth = positiveRound(canvas.width) || cssWidth || 1;
  const backingHeight = positiveRound(canvas.height) || cssHeight || 1;

  return { backingWidth, backingHeight, cssWidth, cssHeight };
}

function createResult(): ProjectedPoint {
  return {
    x: 0,
    y: 0,
    z: 0,
    cssX: 0,
    cssY: 0,
    clipW: 0,
    behindCamera: false,
    clipped: false,
    offscreen: false,
  };
}

function createSnapshot(): Snapshot {
  const viewport: PixelViewport = { x: 0, y: 0, width: 1, height: 1 };
  const options: ProjectOptions = {
    viewport,
    backingWidth: 1,
    backingHeight: 1,
    cssWidth: 1,
    cssHeight: 1,
  };

  return {
    view: new Float32Array(16),
    viewProjection: new Float32Array(16),
    viewport,
    options,
    backingWidth: 1,
    backingHeight: 1,
    cssWidth: 1,
    cssHeight: 1,
  };
}

function copyMatrix(source: unknown, target: Matrix): void {
  target.fill(0);

  const src = source as any;
  if (!src) return;

  let data: any = null;

  if (typeof src.length === "number") {
    data = src;
  } else {
    const candidates = [src.elements, src.m, src.array, src._m, src.mat];
    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      if (candidate && typeof candidate.length === "number") {
        data = candidate;
        break;
      }
    }
  }

  if (!data) return;

  const rawLength = data.length;
  const length = Number.isFinite(rawLength) ? Math.min(16, rawLength) : 0;

  for (let i = 0; i < length; i++) {
    const value = data[i];
    if (typeof value === "number") target[i] = value;
  }
}

function updateSnapshot(snapshot: Snapshot, camera: Camera, canvas: HTMLCanvasElement): void {
  const sizes = readCanvasSizes(canvas);

  snapshot.backingWidth = sizes.backingWidth;
  snapshot.backingHeight = sizes.backingHeight;
  snapshot.cssWidth = sizes.cssWidth;
  snapshot.cssHeight = sizes.cssHeight;

  // The app description says the camera renders to the whole canvas.
  snapshot.viewport.x = 0;
  snapshot.viewport.y = 0;
  snapshot.viewport.width = sizes.backingWidth;
  snapshot.viewport.height = sizes.backingHeight;

  snapshot.options.viewport = snapshot.viewport;
  snapshot.options.backingWidth = sizes.backingWidth;
  snapshot.options.backingHeight = sizes.backingHeight;
  snapshot.options.cssWidth = sizes.cssWidth;
  snapshot.options.cssHeight = sizes.cssHeight;

  let aspect = sizes.backingWidth / sizes.backingHeight;
  const measuredAspect = getEffectiveAspectRatio(camera, sizes.backingWidth, sizes.backingHeight);
  if (Number.isFinite(measuredAspect) && measuredAspect > 0) aspect = measuredAspect;
  if (!Number.isFinite(aspect) || aspect <= 0) aspect = 1;

  // getViewMatrix / getViewProjectionMatrix return the camera's mutable caches,
  // so copy them before anything else can overwrite them.
  copyMatrix(getViewMatrix(camera), snapshot.view);
  copyMatrix(getViewProjectionMatrix(camera, aspect), snapshot.viewProjection);

  const floating = camera
    ? (camera as Camera & { _useFloatingOrigin?: boolean })._useFloatingOrigin
    : false;

  if (floating) {
    const origin = snapshot.worldOrigin || { x: 0, y: 0, z: 0 };
    snapshot.worldOrigin = origin;

    const pos = getCameraPosition(camera) as Vec | null;
    if (pos) {
      origin.x = pos.x;
      origin.y = pos.y;
      origin.z = pos.z;
    } else {
      origin.x = 0;
      origin.y = 0;
      origin.z = 0;
    }

    snapshot.options.worldOrigin = origin;
  } else {
    delete snapshot.options.worldOrigin;
  }
}

function projectPoint(point: Vec, snapshot: Snapshot, result: ProjectedPoint): void {
  projectToRef(point, snapshot.view, snapshot.viewProjection, snapshot.options, result);
}

function safeDifference(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return a - b;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  const stored = createSnapshot();
  const current = createSnapshot();
  const oldResult = createResult();
  const currentResult = createResult();

  const tracker: ShiftTracker = {
    mark(): void {
      updateSnapshot(stored, camera, canvas);
    },

    shift(point: Vec): { dx: number; dy: number } {
      updateSnapshot(current, camera, canvas);

      projectPoint(point, stored, oldResult);
      projectPoint(point, current, currentResult);

      return {
        dx: safeDifference(currentResult.cssX, oldResult.cssX),
        dy: safeDifference(currentResult.cssY, oldResult.cssY),
      };
    },
  };

  tracker.mark();
  return tracker;
}
