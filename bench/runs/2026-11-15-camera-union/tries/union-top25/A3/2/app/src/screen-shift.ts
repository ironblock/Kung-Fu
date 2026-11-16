import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
  type Camera,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

type Mat = ReturnType<typeof getViewMatrix>;
type Viewport = ReturnType<typeof resolveCameraViewport>;

// Everything needed to place a world point on the canvas at one moment.
// The library may return cached storage that it overwrites later, so the
// matrices are copied.
interface Frame {
  view: Mat;
  viewProjection: Mat;
  viewport: Viewport;
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
}

function copyMat(m: Mat): Mat {
  return Float64Array.from(m as unknown as ArrayLike<number>) as unknown as Mat;
}

function captureFrame(camera: Camera, canvas: HTMLCanvasElement): Frame {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  return {
    view: copyMat(getViewMatrix(camera)),
    viewProjection: copyMat(getViewProjectionMatrix(camera, aspect)),
    viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
    backingWidth,
    backingHeight,
    cssWidth: canvas.clientWidth || backingWidth,
    cssHeight: canvas.clientHeight || backingHeight,
  };
}

function screenOf(point: Vec, frame: Frame): { x: number; y: number } {
  const r = projectWorldToScreen(point, frame.view, frame.viewProjection, {
    viewport: frame.viewport,
    backingWidth: frame.backingWidth,
    backingHeight: frame.backingHeight,
    cssWidth: frame.cssWidth,
    cssHeight: frame.cssHeight,
  });
  return { x: r.cssX, y: r.cssY };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  let marked = captureFrame(camera, canvas);

  return {
    mark(): void {
      marked = captureFrame(camera, canvas);
    },
    shift(point: Vec): { dx: number; dy: number } {
      // Each side is projected with the canvas geometry it was drawn with,
      // so the result is the change in where the point is drawn in CSS pixels.
      const before = screenOf(point, marked);
      const now = screenOf(point, captureFrame(camera, canvas));
      return { dx: now.x - before.x, dy: now.y - before.y };
    },
  };
}
