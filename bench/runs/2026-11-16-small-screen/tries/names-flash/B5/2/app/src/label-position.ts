import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";

type ProjectionPoint = Parameters<typeof projectWorldToScreen>[0];
type ProjectionOptions = Parameters<typeof projectWorldToScreen>[2];
type Viewport = ReturnType<typeof resolveCameraViewport>;
type CameraPosition = ReturnType<typeof getCameraPosition>;

function pickPositive(...values: number[]): number {
  for (const value of values) {
    if (Number.isFinite(value) && value > 0) return value;
  }
  return 0;
}

function cssSize(canvas: HTMLCanvasElement): { width: number; height: number } {
  let width = pickPositive(canvas.clientWidth, canvas.offsetWidth);
  let height = pickPositive(canvas.clientHeight, canvas.offsetHeight);

  if (width <= 0 || height <= 0) {
    try {
      const rect = canvas.getBoundingClientRect();
      width = pickPositive(width, rect.width);
      height = pickPositive(height, rect.height);
    } catch {
      // Ignore layout measurement failures.
    }
  }

  width = pickPositive(width, canvas.width);
  height = pickPositive(height, canvas.height);

  return { width, height };
}

function normalizeViewport(
  vp: Viewport | null | undefined,
  backingWidth: number,
  backingHeight: number,
): Viewport {
  const full = { x: 0, y: 0, width: backingWidth, height: backingHeight } as unknown as Viewport;

  if (
    !vp ||
    !Number.isFinite(vp.x) ||
    !Number.isFinite(vp.y) ||
    !Number.isFinite(vp.width) ||
    !Number.isFinite(vp.height) ||
    vp.width <= 0 ||
    vp.height <= 0
  ) {
    return full;
  }

  const x = Math.max(0, Math.min(vp.x, backingWidth));
  const y = Math.max(0, Math.min(vp.y, backingHeight));
  const width = Math.max(0, Math.min(vp.width, backingWidth - x));
  const height = Math.max(0, Math.min(vp.height, backingHeight - y));

  if (width <= 0 || height <= 0) return full;

  return { x, y, width, height } as unknown as Viewport;
}

function safeViewport(camera: Camera, backingWidth: number, backingHeight: number): Viewport {
  try {
    return normalizeViewport(
      resolveCameraViewport(camera, backingWidth, backingHeight),
      backingWidth,
      backingHeight,
    );
  } catch {
    return { x: 0, y: 0, width: backingWidth, height: backingHeight } as unknown as Viewport;
  }
}

function safeWorldOrigin(camera: Camera): CameraPosition | undefined {
  if (!camera._useFloatingOrigin) return undefined;

  try {
    const position = getCameraPosition(camera);
    if (
      Number.isFinite(position.x) &&
      Number.isFinite(position.y) &&
      Number.isFinite(position.z)
    ) {
      return position;
    }
  } catch {
    // Ignore position lookup failures.
  }

  return undefined;
}

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  if (
    !camera ||
    !canvas ||
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.y) ||
    !Number.isFinite(point.z)
  ) {
    return { x: 0, y: 0, visible: false };
  }

  const css = cssSize(canvas);
  const backingWidth = pickPositive(canvas.width, css.width);
  const backingHeight = pickPositive(canvas.height, css.height);

  if (
    css.width <= 0 ||
    css.height <= 0 ||
    backingWidth <= 0 ||
    backingHeight <= 0
  ) {
    return { x: 0, y: 0, visible: false };
  }

  let x = css.width / 2;
  let y = css.height / 2;
  let visible = false;

  try {
    const viewport = safeViewport(camera, backingWidth, backingHeight);
    const aspect = viewport.width / viewport.height;
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);
    const worldOrigin = safeWorldOrigin(camera);

    const projectedPoint = {
      x: point.x,
      y: point.y,
      z: point.z,
    } as unknown as ProjectionPoint;

    const options = {
      viewport,
      backingWidth,
      backingHeight,
      cssWidth: css.width,
      cssHeight: css.height,
      worldOrigin,
    } as unknown as ProjectionOptions;

    const result = projectWorldToScreen(projectedPoint, view, viewProjection, options);

    if (result) {
      const finiteProjection = Number.isFinite(result.cssX) && Number.isFinite(result.cssY);

      if (finiteProjection) {
        x = result.cssX;
        y = result.cssY;
      }

      const behind =
        result.behindCamera === true ||
        (Number.isFinite(result.clipW) && result.clipW <= 0);

      const offscreen = result.offscreen === true;

      const scaleX = css.width / backingWidth;
      const scaleY = css.height / backingHeight;
      const left = viewport.x * scaleX;
      const top = viewport.y * scaleY;
      const right = (viewport.x + viewport.width) * scaleX;
      const bottom = (viewport.y + viewport.height) * scaleY;
      const epsilon = Math.max(1e-6, Math.max(css.width, css.height) * 1e-9);

      const inBounds =
        finiteProjection &&
        x >= left - epsilon &&
        x <= right + epsilon &&
        y >= top - epsilon &&
        y <= bottom + epsilon;

      // Deliberately ignore result.clipped so points beyond the far clipping
      // distance can still be visible when they are inside the picture.
      visible = finiteProjection && !behind && !offscreen && inBounds;
    }
  } catch {
    // If projection fails, leave the label invisible and centered.
  }

  return { x, y, visible };
}
