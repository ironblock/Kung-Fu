import type { Camera, Mat4, Vec3 } from "@babylonjs/lite";
import {
  getCameraPosition,
  getEffectiveAspectRatio,
  getViewMatrix,
  getViewProjectionMatrix,
  projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };

export interface ShiftTracker {
  mark(): void;
  shift(point: Vec): { dx: number; dy: number };
}

/**
 * Copies a Mat4 (a 16-element float array in Babylon) so that later in-place
 * rewrites of the camera's cached matrices cannot clobber the snapshot.
 *
 * camera-notes.md #35: getViewMatrix / getProjectionMatrix /
 * getViewProjectionMatrix return the camera's own cache object, overwritten in
 * place on the next change (or other aspect) -- so a reference must be copied
 * to keep a value.
 */
function copyMat4(src: Mat4): Mat4 {
  const arr = src as unknown as Float32Array;
  const out = new Float32Array(16);
  for (let i = 0; i < 16; i++) out[i] = arr[i];
  return out as unknown as Mat4;
}

function copyVec3(v: Vec3): Vec3 {
  return { x: v.x, y: v.y, z: v.z };
}

/**
 * Tracks how far the on-screen image of a world-space point moves (in CSS
 * pixels) between a remembered camera view ("mark") and the camera as it is
 * now ("shift").
 *
 * Any mix of translation, rotation, zoom and field-of-view change is handled,
 * because the point is projected under two different camera states (the stored
 * mark-time view and the current view) and the CSS-pixel positions are
 * subtracted.
 *
 * Assumptions (see the task and camera-notes.md):
 *  - The camera renders to the whole canvas, so the projection viewport is the
 *    full backing-store rectangle and the aspect ratio is the canvas aspect
 *    (via getEffectiveAspectRatio, per note #36).
 *  - Canvas dimensions are stable between mark() and shift(); they are read
 *    once at construction.
 *  - Points are in front of the camera, so behind/clipped/offscreen handling
 *    is not required.
 */
export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
  // Backing-store (buffer) size and CSS (layout) size. Fall back to the
  // backing size when the CSS size is not yet laid out, and coerce any
  // non-positive value to 1 so projectWorldToScreen never throws RangeError
  // (camera-notes.md #26 / #31: it throws on a zero-size viewport or a
  // cssWidth given without a cssHeight).
  const bw = canvas.width || 1;
  const bh = canvas.height || 1;
  const cw = canvas.clientWidth || bw;
  const ch = canvas.clientHeight || bh;

  // Aspect ratio that matches what is rendered to the whole canvas.
  const aspect = getEffectiveAspectRatio(camera, bw, bh);

  // When the camera uses a floating origin the view/projection matrices are
  // camera-relative and projectWorldToScreen needs the camera's world position
  // as worldOrigin (camera-notes.md #63).
  const floatingOrigin = !!camera._useFloatingOrigin;

  // Snapshot of the camera view taken at the last mark().
  let markView: Mat4;
  let markViewProj: Mat4;
  let markOrigin: Vec3 | null = null;

  function snapshot(): void {
    markView = copyMat4(getViewMatrix(camera));
    markViewProj = copyMat4(getViewProjectionMatrix(camera, aspect));
    markOrigin = floatingOrigin ? copyVec3(getCameraPosition(camera)) : null;
  }

  function project(view: Mat4, viewProj: Mat4, origin: Vec3 | null, point: Vec) {
    const options = {
      viewport: { x: 0, y: 0, width: bw, height: bh },
      backingWidth: bw,
      backingHeight: bh,
      cssWidth: cw,
      cssHeight: ch,
      ...(origin ? { worldOrigin: origin } : {}),
    };
    return projectWorldToScreen(point, view, viewProj, options);
  }

  function mark(): void {
    snapshot();
  }

  function shift(point: Vec): { dx: number; dy: number } {
    // Current camera state. These are the live cache objects; they are used
    // immediately below, so no copy is needed (and even if a later call in
    // this expression refreshes them in place, they still describe the current
    // view, which is what we want).
    const nowView = getViewMatrix(camera);
    const nowViewProj = getViewProjectionMatrix(camera, aspect);
    const nowOrigin = floatingOrigin ? getCameraPosition(camera) : null;

    const atMark = project(markView, markViewProj, markOrigin, point);
    const now = project(nowView, nowViewProj, nowOrigin, point);

    // cssX / cssY are already in CSS pixels (camera-notes.md #31) and y grows
    // downward, so the difference is directly "dx to the right, dy down".
    return { dx: now.cssX - atMark.cssX, dy: now.cssY - atMark.cssY };
  }

  // Mark once at creation, as required.
  snapshot();

  return { mark, shift };
}
