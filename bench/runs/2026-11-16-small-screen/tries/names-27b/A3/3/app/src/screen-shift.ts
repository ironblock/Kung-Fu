import type { Camera } from "@babylonjs/lite";
import {
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

type Mat4 = ReturnType<typeof getViewMatrix>;
type PixelViewport = { x: number; y: number; width: number; height: number };

interface Snapshot {
  view: Mat4;
  viewProjection: Mat4;
  viewport: PixelViewport;
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
}

function cloneMat4(source: Mat4): Mat4 {
  const src = source as unknown as { slice?: (start?: number, end?: number) => Mat4 };
  if (typeof src.slice === "function") {
    return src.slice(0, 16);
  }

  const arr = source as unknown as ArrayLike<number>;
  const out = new Float32Array(16);
  for (let i = 0; i < 16; i++) {
    out[i] = arr[i] || 0;
  }
  return out as unknown as Mat4;
}

function canvasSize(canvas: HTMLCanvasElement) {
  const cssWidth = canvas.clientWidth || canvas.width || 1;
  const cssHeight = canvas.clientHeight || canvas.height || 1;
  const backingWidth = canvas.width || cssWidth;
  const backingHeight = canvas.height || cssHeight;
  return { cssWidth, cssHeight, backingWidth, backingHeight };
}

function makeSnapshot(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
  const { cssWidth, cssHeight, backingWidth, backingHeight } = canvasSize(canvas);

  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;

  const viewport = { ...resolveCameraViewport(camera, backingWidth, backingHeight) };
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, safeAspect);

  return {
    view: cloneMat4(view),
    viewProjection: cloneMat4(viewProjection),
    viewport,
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  };
}

function projectWith(
  point: Vec,
  view: Mat4,
  viewProjection: Mat4,
  viewport: PixelViewport,
  backingWidth: number,
  backingHeight: number,
  cssWidth: number,
  cssHeight: number
) {
  const p: Vec = { x: point.x, y: point.y, z: point.z };
  return projectWorldToScreen(p, view, viewProjection, {
    viewport,
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  });
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let snapshot = makeSnapshot(camera, canvas);

  return {
    mark() {
      snapshot = makeSnapshot(camera, canvas);
    },

    shift(point: Vec) {
      const { cssWidth, cssHeight, backingWidth, backingHeight } = canvasSize(canvas);

      const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
      const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;

      const viewport = { ...resolveCameraViewport(camera, backingWidth, backingHeight) };
      const view = getViewMatrix(camera);
      const viewProjection = getViewProjectionMatrix(camera, safeAspect);

      const now = projectWith(
        point,
        view,
        viewProjection,
        viewport,
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight
      );

      const then = projectWith(
        point,
        snapshot.view,
        snapshot.viewProjection,
        snapshot.viewport,
        snapshot.backingWidth,
        snapshot.backingHeight,
        snapshot.cssWidth,
        snapshot.cssHeight
      );

      const dx = now.cssX - then.cssX;
      const dy = now.cssY - then.cssY;

      return {
        dx: Number.isFinite(dx) ? dx : 0,
        dy: Number.isFinite(dy) ? dy : 0,
      };
    },
  };
}
