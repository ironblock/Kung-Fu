import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getProjectionMatrix,
    getViewMatrix,
} from "@babylonjs/lite";

export interface LabelPosition {
    x: number;
    y: number;
    visible: boolean;
}

/** Row `r` of a column-major 4x4 matrix dotted with homogeneous vector (x, y, z, w). */
function rowDot(m: ArrayLike<number>, r: number, x: number, y: number, z: number, w: number): number {
    return m[r] * x + m[r + 4] * y + m[r + 8] * z + m[r + 12] * w;
}

/**
 * Projects a world-space point to CSS pixels on a canvas the camera renders to in full.
 *
 * - x, y: CSS pixel position from the canvas's top-left corner. Points outside the picture
 *   still get their (off-screen) position, so they can be used for edge arrows.
 * - visible: the point is in front of the camera (positive clip w) and inside the picture.
 *   The far clipping plane is ignored, so distant points can be visible.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): LabelPosition {
    const view = getViewMatrix(camera);
    const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);

    // The projection's far plane only affects row 2 (depth). Rows 0, 1 and 3 (x, y, w)
    // of a perspective matrix do not depend on near/far, so the far plane is never used here.
    const proj = getProjectionMatrix(camera, aspect);

    // World -> view space (homogeneous, w = 1).
    const px = point.x, py = point.y, pz = point.z;
    const vx = rowDot(view, 0, px, py, pz, 1);
    const vy = rowDot(view, 1, px, py, pz, 1);
    const vz = rowDot(view, 2, px, py, pz, 1);
    const vw = rowDot(view, 3, px, py, pz, 1);

    // View -> clip space, using only the x, y and w rows.
    const clipX = rowDot(proj, 0, vx, vy, vz, vw);
    const clipY = rowDot(proj, 1, vx, vy, vz, vw);
    const clipW = rowDot(proj, 3, vx, vy, vz, vw);

    const inFront = clipW > 0;
    const ndcX = clipX / clipW;
    const ndcY = clipY / clipW;

    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    // NDC y points up; CSS y points down.
    const x = ((ndcX + 1) / 2) * cssWidth;
    const y = ((1 - ndcY) / 2) * cssHeight;

    const inPicture = Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1;

    return { x, y, visible: inFront && inPicture };
}
