import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getViewProjectionMatrix,
  getEffectiveAspectRatio,
  getCameraPosition,
  resolveCameraViewport,
  projectWorldToScreen,
} from "@babylonjs/lite";

export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const cssWidth = canvas.clientWidth || backingWidth;
  const cssHeight = canvas.clientHeight || backingHeight;

  // Resolve the pixel viewport, accounting for camera.viewport and clamping
  // to the canvas edges (note 13).
  const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

  // Use the effective aspect ratio so the projection matches what is rendered
  // (note 36: getProjectionMatrix does not apply camera.viewport itself).
  const aspect = getEffectiveAspectRatio(camera, viewport.width, viewport.height);

  // Fetch the view and view-projection matrices. These return the camera's
  // own cache objects, which are overwritten in place on the next change
  // (note 35), so we consume them immediately.
  const view = getViewMatrix(camera);
  const viewProjection = getViewProjectionMatrix(camera, aspect);

  const options: {
    viewport: { x: number; y: number; width: number; height: number };
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
    worldOrigin?: { x: number; y: number; z: number };
  } = {
    viewport,
    backingWidth,
    backingHeight,
    cssWidth,
    cssHeight,
  };

  // When the camera uses a floating origin, the matrices are camera-relative
  // and projectWorldToScreen needs the camera's world position as the origin
  // (note 63).
  if (camera._useFloatingOrigin) {
    options.worldOrigin = getCameraPosition(camera);
  }

  const result = projectWorldToScreen(point, view, viewProjection, options);

  // Visible means the point is in front of the camera and inside the picture.
  // Points beyond the far plane but still in-frame count as visible (spec).
  // Points behind the camera are never visible.
  const visible = !result.behindCamera && !result.offscreen;

  return {
    x: result.cssX,
    y: result.cssY,
    visible,
  };
}
