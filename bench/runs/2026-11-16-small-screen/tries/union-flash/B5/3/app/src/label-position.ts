import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";

type Vec3Like = { x: number; y: number; z: number };
type PixelViewportLike = { x: number; y: number; width: number; height: number };

type ProjectionResultLike = {
  x?: number;
  y?: number;
  z?: number;
  cssX?: number;
  cssY?: number;
  clipW?: number;
  behindCamera?: boolean;
  clipped?: boolean;
  offscreen?: boolean;
};

const EPS = 1e-6;

function finiteNumber(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

function positiveFinite(value: unknown): boolean {
  return finiteNumber(value) && (value as number) > 0;
}

function canvasPixels(canvas: HTMLCanvasElement) {
  const rawBackingWidth = canvas.width;
  const rawBackingHeight = canvas.height;

  let cssWidth = canvas.clientWidth;
  let cssHeight = canvas.clientHeight;

  // Some runtimes / test environments do not provide layout dimensions. If CSS
  // pixel dimensions are missing, fall back to the drawing-buffer dimensions.
  if (!positiveFinite(cssWidth) || !positiveFinite(cssHeight)) {
    try {
      const rect = canvas.getBoundingClientRect();
      if (positiveFinite(rect.width)) cssWidth = rect.width;
      if (positiveFinite(rect.height)) cssHeight = rect.height;
    } catch {
      // No layout information is available; use the backing buffer below.
    }
  }

  const hasUsableSize =
    (positiveFinite(rawBackingWidth) && positiveFinite(rawBackingHeight)) ||
    (positiveFinite(cssWidth) && positiveFinite(cssHeight));

  const backingWidth = positiveFinite(rawBackingWidth)
    ? rawBackingWidth
    : positiveFinite(cssWidth)
      ? cssWidth
      : 1;

  const backingHeight = positiveFinite(rawBackingHeight)
    ? rawBackingHeight
    : positiveFinite(cssHeight)
      ? cssHeight
      : 1;

  const finalCssWidth = positiveFinite(cssWidth) ? cssWidth : backingWidth;
  const finalCssHeight = positiveFinite(cssHeight) ? cssHeight : backingHeight;

  return {
    backingWidth,
    backingHeight,
    cssWidth: finalCssWidth,
    cssHeight: finalCssHeight,
    hasUsableSize,
  };
}

function sanitizeViewport(
  viewport: PixelViewportLike | null | undefined,
  backingWidth: number,
  backingHeight: number,
): PixelViewportLike {
  const fallback: PixelViewportLike = {
    x: 0,
    y: 0,
    width: backingWidth,
    height: backingHeight,
  };

  if (!viewport) return fallback;

  // projectWorldToScreen expects a positive backing-pixel viewport. The camera
  // viewport's y is counted from the bottom in the API notes, but
  // resolveCameraViewport returns y from the top; this code assumes that
  // returned top-left form and clamps it into the canvas as the viewport helper
  // is documented to do.
  const x = finiteNumber(viewport.x)
    ? Math.max(0, Math.min(backingWidth, viewport.x))
    : 0;

  const y = finiteNumber(viewport.y)
    ? Math.max(0, Math.min(backingHeight, viewport.y))
    : 0;

  const width = finiteNumber(viewport.width)
    ? Math.max(0, Math.min(backingWidth - x, viewport.width))
    : backingWidth;

  const height = finiteNumber(viewport.height)
    ? Math.max(0, Math.min(backingHeight - y, viewport.height))
    : backingHeight;

  if (width <= 0 || height <= 0) return fallback;

  return { x, y, width, height };
}

function resolveViewportSafe(
  camera: Camera,
  backingWidth: number,
  backingHeight: number,
): PixelViewportLike {
  try {
    return sanitizeViewport(
      resolveCameraViewport(camera, backingWidth, backingHeight),
      backingWidth,
      backingHeight,
    );
  } catch {
    return sanitizeViewport(undefined, backingWidth, backingHeight);
  }
}

function copyLike<T>(src: T): T {
  // Matrix caches returned by the camera helpers are overwritten in place, so
  // make a local copy before using them in the projection call.
  const maybe = src as unknown as { slice?: () => T; length?: number };

  if (maybe && typeof maybe.slice === "function") {
    return maybe.slice();
  }

  if (maybe && typeof maybe.length === "number") {
    return Array.from(maybe as ArrayLike<number>) as unknown as T;
  }

  return src;
}

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  if (!camera || !canvas || !point) {
    return { x: 0, y: 0, visible: false };
  }

  const sizes = canvasPixels(canvas);

  if (!sizes.hasUsableSize) {
    return { x: 0, y: 0, visible: false };
  }

  const fallbackX = sizes.cssWidth / 2;
  const fallbackY = sizes.cssHeight / 2;

  if (
    !finiteNumber(point.x) ||
    !finiteNumber(point.y) ||
    !finiteNumber(point.z)
  ) {
    return { x: fallbackX, y: fallbackY, visible: false };
  }

  try {
    const viewport = resolveViewportSafe(
      camera,
      sizes.backingWidth,
      sizes.backingHeight,
    );

    const scaleX = sizes.cssWidth / sizes.backingWidth;
    const scaleY = sizes.cssHeight / sizes.backingHeight;

    const cssViewport: PixelViewportLike = {
      x: viewport.x * scaleX,
      y: viewport.y * scaleY,
      width: viewport.width * scaleX,
      height: viewport.height * scaleY,
    };

    let aspect = 0;

    try {
      const effectiveAspect = getEffectiveAspectRatio(
        camera,
        sizes.backingWidth,
        sizes.backingHeight,
      );

      if (positiveFinite(effectiveAspect)) {
        aspect = effectiveAspect;
      }
    } catch {
      aspect = 0;
    }

    if (!positiveFinite(aspect)) {
      aspect = viewport.width / viewport.height;
    }

    if (!positiveFinite(aspect)) {
      aspect = sizes.backingWidth / sizes.backingHeight;
    }

    const view = copyLike(getViewMatrix(camera));
    const viewProjection = copyLike(getViewProjectionMatrix(camera, aspect));

    let worldOrigin: Vec3Like | undefined;

    // With floating origin, the cached view/projection matrices are
    // camera-relative; projectWorldToScreen needs the camera's world position.
    if (Boolean((camera as any)._useFloatingOrigin)) {
      const position = getCameraPosition(camera);
      worldOrigin = {
        x: position.x,
        y: position.y,
        z: position.z,
      };
    }

    const worldPoint: Vec3Like = {
      x: point.x,
      y: point.y,
      z: point.z,
    };

    const options = {
      viewport,
      backingWidth: sizes.backingWidth,
      backingHeight: sizes.backingHeight,
      worldOrigin,
      cssWidth: sizes.cssWidth,
      cssHeight: sizes.cssHeight,
    };

    const result = projectWorldToScreen(
      worldPoint as any,
      view as any,
      viewProjection as any,
      options as any,
    ) as ProjectionResultLike;

    if (!result) {
      return { x: fallbackX, y: fallbackY, visible: false };
    }

    const hadCssX = finiteNumber(result.cssX);
    const hadCssY = finiteNumber(result.cssY);
    const hadBackingX = finiteNumber(result.x);
    const hadBackingY = finiteNumber(result.y);

    const x = hadCssX
      ? (result.cssX as number)
      : hadBackingX
        ? (result.x as number) * scaleX
        : fallbackX;

    const y = hadCssY
      ? (result.cssY as number)
      : hadBackingY
        ? (result.y as number) * scaleY
        : fallbackY;

    const validCoordinates =
      (hadCssX || hadBackingX) && (hadCssY || hadBackingY);

    const behindCamera = Boolean(result.behindCamera);

    // clipW > 0 means the point is in front of the camera for perspective
    // projection. For orthographic / unusual cases, fall back to
    // projectWorldToScreen's behindCamera flag if clipW is unavailable.
    const inFront = finiteNumber(result.clipW)
      ? (result.clipW as number) > 0
      : !behindCamera;

    const insidePicture =
      x >= cssViewport.x - EPS &&
      x <= cssViewport.x + cssViewport.width + EPS &&
      y >= cssViewport.y - EPS &&
      y <= cssViewport.y + cssViewport.height + EPS;

    // The result's clipped flag is intentionally ignored: points beyond the
    // far clipping distance should remain visible when they are inside the
    // picture. Points behind the camera are never visible.
    const visible = validCoordinates && !behindCamera && inFront && insidePicture;

    return { x, y, visible };
  } catch {
    return { x: fallbackX, y: fallbackY, visible: false };
  }
}
