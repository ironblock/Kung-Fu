import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getProjectionMatrix,
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

type Matrix = ReturnType<typeof getViewMatrix>;
type ViewProjectionMatrix = ReturnType<typeof getViewProjectionMatrix>;
type PixelViewport = ReturnType<typeof resolveCameraViewport>;
type ProjectWorldToScreenParameters = Parameters<typeof projectWorldToScreen>;
type ScreenProjectionOptions = ProjectWorldToScreenParameters[2];
type PointArgument = ProjectWorldToScreenParameters[0];

interface Snapshot {
  view: Matrix;
  viewProjection: ViewProjectionMatrix;
  viewport: PixelViewport;
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
  worldOrigin?: Vec;
  valid: boolean;
}

function positiveFinite(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function devicePixelRatio(canvas: HTMLCanvasElement): number {
  const ratio = canvas.ownerDocument?.defaultView?.devicePixelRatio ?? 1;
  return positiveFinite(ratio, 1);
}

function canvasMetrics(canvas: HTMLCanvasElement) {
  const dpr = devicePixelRatio(canvas);
  const cssWidth = positiveFinite(canvas.clientWidth, positiveFinite(canvas.width / dpr, 1));
  const cssHeight = positiveFinite(canvas.clientHeight, positiveFinite(canvas.height / dpr, 1));
  const backingWidth = positiveFinite(canvas.width, positiveFinite(Math.round(cssWidth * dpr), 1));
  const backingHeight = positiveFinite(canvas.height, positiveFinite(Math.round(cssHeight * dpr), 1));
  return { backingWidth, backingHeight, cssWidth, cssHeight };
}

function fullViewport(backingWidth: number, backingHeight: number): PixelViewport {
  return { x: 0, y: 0, width: backingWidth, height: backingHeight };
}

function sanitizeViewport(vp: PixelViewport, backingWidth: number, backingHeight: number): PixelViewport {
  if (
    !Number.isFinite(vp.x) ||
    !Number.isFinite(vp.y) ||
    !Number.isFinite(vp.width) ||
    !Number.isFinite(vp.height) ||
    vp.width <= 0 ||
    vp.height <= 0
  ) {
    return fullViewport(backingWidth, backingHeight);
  }

  const x = Math.max(0, Math.min(vp.x, backingWidth));
  const y = Math.max(0, Math.min(vp.y, backingHeight));
  const width = Math.min(vp.width, backingWidth - x);
  const height = Math.min(vp.height, backingHeight - y);

  if (width <= 0 || height <= 0) {
    return fullViewport(backingWidth, backingHeight);
  }

  return { x, y, width, height };
}

function cameraViewport(camera: Camera, backingWidth: number, backingHeight: number): PixelViewport {
  try {
    return sanitizeViewport(resolveCameraViewport(camera, backingWidth, backingHeight), backingWidth, backingHeight);
  } catch {
    return fullViewport(backingWidth, backingHeight);
  }
}

function effectiveAspect(camera: Camera, backingWidth: number, backingHeight: number, viewport: PixelViewport): number {
  try {
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    if (Number.isFinite(aspect) && aspect > 0) {
      return aspect;
    }
  } catch {
    // fall through to viewport-based aspect
  }

  const aspect = viewport.width / viewport.height;
  return Number.isFinite(aspect) && aspect > 0 ? aspect : backingWidth / backingHeight;
}

function copyMatrix<T>(src: T): T {
  const source = src as unknown as { [index: number]: number | undefined };
  const copy = new Float32Array(16);
  for (let i = 0; i < 16; i++) {
    copy[i] = source[i] ?? 0;
  }
  return copy as unknown as T;
}

function matrixIsUsable<T>(matrix: T): boolean {
  const m = matrix as unknown as { [index: number]: number | undefined };
  let hasNonZero = false;
  for (let i = 0; i < 16; i++) {
    const value = m[i];
    if (value === undefined || !Number.isFinite(value)) {
      return false;
    }
    if (value !== 0) {
      hasNonZero = true;
    }
  }
  return hasNonZero;
}

function finiteVec(v: Vec): boolean {
  return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
}

function cloneCameraPosition(camera: Camera): Vec {
  try {
    const pos = getCameraPosition(camera);
    return { x: pos.x, y: pos.y, z: pos.z };
  } catch {
    return { x: Number.NaN, y: Number.NaN, z: Number.NaN };
  }
}

function takeSnapshot(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
  const metrics = canvasMetrics(canvas);
  const viewport = cameraViewport(camera, metrics.backingWidth, metrics.backingHeight);
  const aspect = effectiveAspect(camera, metrics.backingWidth, metrics.backingHeight, viewport);

  const worldOrigin = camera._useFloatingOrigin ? cloneCameraPosition(camera) : undefined;

  // Rebuild the projection cache before reading the view-projection cache.
  void getProjectionMatrix(camera, aspect);

  // Read the view-projection first; if refreshing it also refreshes the view cache,
  // copying the view afterwards keeps the two snapshots consistent.
  const viewProjection = copyMatrix(getViewProjectionMatrix(camera, aspect));
  const view = copyMatrix(getViewMatrix(camera));

  const valid =
    matrixIsUsable(view) &&
    matrixIsUsable(viewProjection) &&
    (!worldOrigin || finiteVec(worldOrigin));

  return {
    view,
    viewProjection,
    viewport,
    backingWidth: metrics.backingWidth,
    backingHeight: metrics.backingHeight,
    cssWidth: metrics.cssWidth,
    cssHeight: metrics.cssHeight,
    worldOrigin,
    valid,
  };
}

function screenCss(snapshot: Snapshot, point: Vec): { x: number; y: number } {
  if (!snapshot.valid) {
    return { x: Number.NaN, y: Number.NaN };
  }

  try {
    const options = {
      viewport: snapshot.viewport,
      backingWidth: snapshot.backingWidth,
      backingHeight: snapshot.backingHeight,
      cssWidth: snapshot.cssWidth,
      cssHeight: snapshot.cssHeight,
      ...(snapshot.worldOrigin ? { worldOrigin: snapshot.worldOrigin } : {}),
    } as unknown as ScreenProjectionOptions;

    const result = projectWorldToScreen(
      point as unknown as PointArgument,
      snapshot.view,
      snapshot.viewProjection,
      options,
    );

    const x = result.cssX;
    const y = result.cssY;
    if (Number.isFinite(x) && Number.isFinite(y)) {
      return { x, y };
    }
  } catch {
    // invalid canvas/camera state is handled by returning NaN
  }

  return { x: Number.NaN, y: Number.NaN };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let lastSnapshot = takeSnapshot(camera, canvas);

  return {
    mark(): void {
      lastSnapshot = takeSnapshot(camera, canvas);
    },
    shift(point: Vec): { dx: number; dy: number } {
      try {
        const currentSnapshot = takeSnapshot(camera, canvas);
        const before = screenCss(lastSnapshot, point);
        const after = screenCss(currentSnapshot, point);
        const dx = after.x - before.x;
        const dy = after.y - before.y;

        if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
          return { dx: 0, dy: 0 };
        }

        return { dx, dy };
      } catch {
        return { dx: 0, dy: 0 };
      }
    },
  };
}
