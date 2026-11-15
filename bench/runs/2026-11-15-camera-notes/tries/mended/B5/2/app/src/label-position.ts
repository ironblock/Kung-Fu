import type { Camera } from "@babylonjs/lite";
import { getViewProjectionMatrix } from "@babylonjs/lite";

/**
 * Projects a world-space point to CSS pixels on a canvas the camera fills.
 *
 * - x/y: where the point lands, in CSS pixels from the canvas's top-left corner.
 *   Points outside the picture (but in front of the camera) get coordinates past
 *   the edge, so they can drive an arrow.
 * - visible: the point is in front of the camera and inside the picture.
 *   Depth is ignored entirely, so points beyond farPlane still count as visible.
 *   Points behind the camera are never visible.
 *
 * Assumes Babylon's conventions: column-major matrices used with row vectors,
 * left-handed clip space where clip.w is the view-space depth (positive in front).
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    // Backing-store aspect: the camera renders to the whole canvas.
    const m: ArrayLike<number> = getViewProjectionMatrix(camera, canvas.width / canvas.height);
    const { x, y, z } = point;

    // Clip-space x, y, w. x and y do not depend on near/far, so the far plane
    // cannot clip anything here; we never look at clip z.
    const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
    const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
    const cw = m[3] * x + m[7] * y + m[11] * z + m[15];

    const inFront = cw > 0;
    // Divide by |w| so a point at w = 0 or behind the camera still gives finite coordinates.
    const denom = Math.max(Math.abs(cw), 1e-12);
    const ndcX = cx / denom;
    const ndcY = cy / denom;

    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    return {
        x: ((ndcX + 1) / 2) * cssWidth,
        y: ((1 - ndcY) / 2) * cssHeight,
        visible: inFront && Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1,
    };
}
