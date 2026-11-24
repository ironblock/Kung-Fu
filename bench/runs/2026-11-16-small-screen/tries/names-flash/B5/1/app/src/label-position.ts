import type { Camera } from "@babylonjs/lite";
import {
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";

function finite(value: number): boolean {
  return Number.isFinite(value);
}

function positiveFinite(value: number, fallback: number): number {
  return finite(value) && value > 0 ? value : fallback;
}

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
  const rect = canvas.getBoundingClientRect();

  // CSS pixel size of the canvas, with fallbacks for detached / zero-sized canvases.
  const cssWidth = positiveFinite(
    canvas.clientWidth,
    positiveFinite(rect.width, positiveFinite(canvas.width, 1))
  );
  const cssHeight = positiveFinite(
    canvas.clientHeight,
    positiveFinite(rect.height, positiveFinite(canvas.height, 1))
  );

  // Render-target / backing-buffer size.
  const backingWidth = positiveFinite(canvas.width, cssWidth);
  const backingHeight = positiveFinite(canvas.height, cssHeight);

  const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);
  const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

  const projected = projectWorldToScreen(
    point as unknown as Parameters<typeof projectWorldToScreen>[0],
    view,
    viewProjection,
    {
      viewport,
      backingWidth,
      backingHeight,
      cssWidth,
      cssHeight,
    }
  );

  const scaleX = cssWidth / backingWidth;
  const scaleY = cssHeight / backingHeight;

  const viewportX = finite(viewport.x) ? viewport.x : 0;
  const viewportY = finite(viewport.y) ? viewport.y : 0;
  const viewportWidth = finite(viewport.width) ? viewport.width : backingWidth;
  const viewportHeight = finite(viewport.height) ? viewport.height : backingHeight;

  const viewportLeft = viewportX * scaleX;
  const viewportTop = viewportY * scaleY;
  const viewportRight = viewportLeft + viewportWidth * scaleX;
  const viewportBottom = viewportTop + viewportHeight * scaleY;

  const fallbackX = viewportLeft + Math.max(0, viewportWidth) * scaleX * 0.5;
  const fallbackY = viewportTop + Math.max(0, viewportHeight) * scaleY * 0.5;

  const xFinite = finite(projected.cssX);
  const yFinite = finite(projected.cssY);

  const x = xFinite ? projected.cssX : fallbackX;
  const y = yFinite ? projected.cssY : fallbackY;

  const viewportValid = viewportWidth > 0 && viewportHeight > 0;
  const epsilon = 1e-6;

  const insidePicture =
    xFinite &&
    yFinite &&
    viewportValid &&
    x >= viewportLeft - epsilon &&
    x <= viewportRight + epsilon &&
    y >= viewportTop - epsilon &&
    y <= viewportBottom + epsilon;

  const clipWFinite = finite(projected.clipW);

  // Points behind the camera are never visible. For perspective cameras, clipW
  // also gives a useful front/back check. For orthographic cameras, rely on
  // the library's behindCamera flag if clipW is not meaningful.
  const inFront = !projected.behindCamera && (!clipWFinite || projected.clipW > 0);

  // Do not use projected.clipped for visibility: far-plane clipping should
  // still count as visible, and near-plane behavior is not specified as a
  // visibility condition here. offscreen is used to detect points outside the
  // picture / viewport rectangle.
  const visible = inFront && insidePicture && !projected.offscreen;

  return { x, y, visible };
}
