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

type Matrix = ReturnType<typeof getViewMatrix>;
type PixelViewport = { x: number; y: number; width: number; height: number };

interface CanvasMetrics {
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
  viewport: PixelViewport;
}

interface Snapshot {
  view: Matrix;
  viewProjection: Matrix;
  metrics: CanvasMetrics;
  worldOrigin: Vec | null;
}

function positiveFinite(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function copyMatrix(m: Matrix): Matrix {
  return (m as { slice(): Matrix }).slice();
}

function copyVec(v: { x: number; y: number; z: number }): Vec {
  return { x: v.x, y: v.y, z: v.z };
}

function canvasMetrics(camera: Camera, canvas: HTMLCanvasElement): CanvasMetrics {
  const backingWidth = positiveFinite(canvas.width, 1);
  const backingHeight = positiveFinite(canvas.height, 1);

  let cssWidth = positiveFinite(canvas.clientWidth, 0);
  let cssHeight = positiveFinite(canvas.clientHeight, 0);
  if (cssWidth === 0 || cssHeight === 0) {
    const rect = canvas.getBoundingClientRect();
    cssWidth = positiveFinite(cssWidth, positiveFinite(rect.width, backingWidth));
    cssHeight = positiveFinite(cssHeight, positiveFinite(rect.height, backingHeight));
  }
  cssWidth = positiveFinite(cssWidth, backingWidth);
  cssHeight = positiveFinite(cssHeight, backingHeight);

  const vp = resolveCameraViewport(camera, backingWidth, backingHeight);
  const viewport: PixelViewport =
    vp &&
    Number.isFinite(vp.x) &&
    Number.isFinite(vp.y) &&
    Number.isFinite(vp.width) &&
    Number.isFinite(vp.height) &&
    vp.width > 0 &&
    vp.height > 0
      ? { x: vp.x, y: vp.y, width: vp.width, height: vp.height }
      : { x: 0, y: 0, width: backingWidth, height: backingHeight };

  return { backingWidth, backingHeight, cssWidth, cssHeight, viewport };
}

function snapshot(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
  const metrics = canvasMetrics(camera, canvas);
  let aspect = getEffectiveAspectRatio(camera, metrics.backingWidth, metrics.backingHeight);
  if (!Number.isFinite(aspect) || aspect <= 0) {
    aspect = metrics.backingWidth / metrics.backingHeight;
  }

  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);
  const worldOrigin = camera._useFloatingOrigin ? copyVec(getCameraPosition(camera)) : null;

  return {
    view: copyMatrix(view),
    viewProjection: copyMatrix(viewProjection),
    metrics,
    worldOrigin,
  };
}

function projectToCss(
  point: Vec,
  view: Matrix,
  viewProjection: Matrix,
  metrics: CanvasMetrics,
  worldOrigin: Vec | null
): { cssX: number; cssY: number; behindCamera: boolean } {
  const result = projectWorldToScreen(
    { x: point.x, y: point.y, z: point.z },
    view,
    viewProjection,
    {
      viewport: { ...metrics.viewport },
      backingWidth: metrics.backingWidth,
      backingHeight: metrics.backingHeight,
      cssWidth: metrics.cssWidth,
      cssHeight: metrics.cssHeight,
      worldOrigin: worldOrigin ? { ...worldOrigin } : undefined,
    }
  );
  return { cssX: result.cssX, cssY: result.cssY, behindCamera: result.behindCamera };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let reference = snapshot(camera, canvas);

  return {
    mark() {
      reference = snapshot(camera, canvas);
    },
    shift(point) {
      const current = snapshot(camera, canvas);
      const before = projectToCss(
        point,
        reference.view,
        reference.viewProjection,
        reference.metrics,
        reference.worldOrigin
      );
      const after = projectToCss(
        point,
        current.view,
        current.viewProjection,
        current.metrics,
        current.worldOrigin
      );

      if (before.behindCamera || after.behindCamera) {
        return { dx: 0, dy: 0 };
      }

      const dx =
        Number.isFinite(before.cssX) && Number.isFinite(after.cssX)
          ? after.cssX - before.cssX
          : 0;
      const dy =
        Number.isFinite(before.cssY) && Number.isFinite(after.cssY)
          ? after.cssY - before.cssY
          : 0;

      return { dx, dy };
    },
  };
}
