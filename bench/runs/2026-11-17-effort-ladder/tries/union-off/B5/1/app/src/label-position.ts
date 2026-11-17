import type { Camera } from "@babylonjs/lite";
import {
  getViewMatrix,
  getViewProjectionMatrix,
  getEffectiveAspectRatio,
  resolveCameraViewport,
  projectWorldToScreen,
  getCameraPosition,
} from "@babylonjs/lite";

/**
 * Project a world-space point to CSS-pixel coordinates on the canvas.
 *
 * Returns x/y measured from the canvas's top-left corner in CSS pixels,
 * plus a `visible` flag meaning the point is in front of the camera and
 * inside the picture (however far away). Points beyond the far clipping
 * distance that are still in frame count as visible; points in front of
 * the camera but outside the picture are not visible (though x/y still
 * report where they would land, past the edge); points behind the camera
 * are never visible.
 */
export function labelPosition(
  camera: Camera,
  canvas: HTMLCanvasElement,
  point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
  // Canvas sizes. Backing store is the raw buffer; CSS size is what the
  // browser actually displays. We project into the backing store and then
  // scale to CSS pixels via cssWidth/cssHeight.
  const backingWidth = canvas.width;
  const backingHeight = canvas.height;
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;

  // Resolve the camera's viewport (in pixels, y from the top) against the
  // backing-store size. This accounts for camera.viewport and clamps edges.
  const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

  // Aspect ratio matching what is actually rendered (note 36: the
  // projection matrix does not apply camera.viewport itself).
  const aspect = getEffectiveAspectRatio(camera, viewport.width, viewport.height);

  // The view and view-projection matrices are the camera's own caches,
  // overwritten in place on the next change (note 35). Copy them so the
  // second call can't clobber the first.
  const view = getViewMatrix(camera);
  const viewCopy = view.slice();
  const viewProjection = getViewProjectionMatrix(camera, aspect);
  const vpCopy = viewProjection.slice();

  // If the camera uses a floating origin, the matrices are camera-relative
  // and projectWorldToScreen needs the camera's world position as the
  // world origin (note 63).
  const worldOrigin = camera._useFloatingOrigin ? getCameraPosition(camera) : undefined;

  const result = projectWorldToScreen(
    point,
    viewCopy,
    vpCopy,
    {
      viewport,
      backingWidth,
      backingHeight,
      worldOrigin,
      cssWidth,
      cssHeight,
    },
  );

  // cssX/cssY are already scaled to CSS pixels (note 31). They are unclamped,
  // so an off-side point keeps a coordinate past the edge — useful for an
  // arrow.
  const x = result.cssX;
  const y = result.cssY;

  // Visible means in front of the camera and inside the picture. A point
  // past the far plane but in frame has only `clipped` set (not `offscreen`),
  // so it counts as visible. A point behind the camera has `behindCamera`
  // and `offscreen` set; a point in front but outside the picture has
  // `offscreen` set. Both are excluded here.
  const visible = !result.behindCamera && !result.offscreen;

  return { x, y, visible };
}
