import type { Camera } from "@babylonjs/lite";
import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
  resolveCameraViewport,
} from "@babylonjs/lite";

interface ProjectionOptions {
  viewport: { x: number; y: number; width: number; height: number };
  backingWidth: number;
  backingHeight: number;
  cssWidth: number;
  cssHeight: number;
  worldOrigin?: { x: number; y: number; z: number };
}

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
  if (!camera || !canvas || !point) {
    return { x: 0, y: 0, visible: false };
  }

  const backingWidth = canvas.width;
  const backingHeight = canvas.height;

  if (
    !Number.isFinite(backingWidth) ||
    backingWidth <= 0 ||
    !Number.isFinite(backingHeight) ||
    backingHeight <= 0
  ) {
    return { x: 0, y: 0, visible: false };
  }

  if (
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.y) ||
    !Number.isFinite(point.z)
  ) {
    return { x: 0, y: 0, visible: false };
  }

  try {
    const rawViewport = resolveCameraViewport(camera, backingWidth, backingHeight);
    const viewport = {
      x: rawViewport.x,
      y: rawViewport.y,
      width: rawViewport.width,
      height: rawViewport.height,
    };

    if (
      !Number.isFinite(viewport.x) ||
      !Number.isFinite(viewport.y) ||
      !Number.isFinite(viewport.width) ||
      viewport.width <= 0 ||
      !Number.isFinite(viewport.height) ||
      viewport.height <= 0
    ) {
      return { x: 0, y: 0, visible: false };
    }

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    if (!Number.isFinite(aspect) || aspect <= 0) {
      return { x: 0, y: 0, visible: false };
    }

    let worldOrigin: ProjectionOptions["worldOrigin"];
    if (camera._useFloatingOrigin) {
      const pos = getCameraPosition(camera);
      if (
        !pos ||
        !Number.isFinite(pos.x) ||
        !Number.isFinite(pos.y) ||
        !Number.isFinite(pos.z)
      ) {
        return { x: 0, y: 0, visible: false };
      }
      worldOrigin = { x: pos.x, y: pos.y, z: pos.z };
    }

    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    let cssWidth = canvas.clientWidth;
    let cssHeight = canvas.clientHeight;

    if (
      !Number.isFinite(cssWidth) ||
      cssWidth <= 0 ||
      !Number.isFinite(cssHeight) ||
      cssHeight <= 0
    ) {
      cssWidth = backingWidth;
      cssHeight = backingHeight;
    }

    const options: ProjectionOptions = {
      viewport,
      backingWidth,
      backingHeight,
      cssWidth,
      cssHeight,
    };

    if (worldOrigin) {
      options.worldOrigin = worldOrigin;
    }

    const projected = projectWorldToScreen(point, view, viewProjection, options);

    const x = Number.isFinite(projected.cssX) ? projected.cssX : 0;
    const y = Number.isFinite(projected.cssY) ? projected.cssY : 0;

    // `clipped` is intentionally ignored: far-clipped points should still be
    // visible if they are not behind the camera and are inside the picture.
    const visible =
      projected.behindCamera === false &&
      projected.offscreen === false &&
      Number.isFinite(projected.cssX) &&
      Number.isFinite(projected.cssY);

    return { x, y, visible };
  } catch {
    return { x: 0, y: 0, visible: false };
  }
}
