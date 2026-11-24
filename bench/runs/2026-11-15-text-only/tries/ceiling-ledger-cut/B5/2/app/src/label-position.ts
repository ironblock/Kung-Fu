import type { Camera } from "@babylonjs/lite";
import { getProjectionMatrix, getViewProjectionMatrix } from "@babylonjs/lite";

type Mat4 = ArrayLike<number>;

/**
 * Where a world-space point lands on the canvas, in CSS pixels from the
 * canvas's top-left corner.
 *
 * `visible` is true when the point is in front of the camera and inside the
 * picture. The near and far clipping distances are deliberately ignored, so
 * distant terrain beyond farPlane still counts as visible. For a point in front
 * of the camera but outside the picture, x/y are still its (off-canvas)
 * position. A point behind the camera is never visible.
 *
 * Matrix layout: the flat 16-element array is read so that
 * clip[i] = x*m[i] + y*m[4+i] + z*m[8+i] + m[12+i], which holds both for
 * column-major/column-vector and row-major/row-vector storage, and for either
 * handedness.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    // Both getters go through the camera's change key, so fresh fov / nearPlane /
    // farPlane / ortho values are picked up here.
    const vp: Mat4 = getViewProjectionMatrix(camera) as unknown as Mat4;
    const proj: Mat4 = getProjectionMatrix(camera) as unknown as Mat4;

    const { x, y, z } = point;
    const cx = x * vp[0] + y * vp[4] + z * vp[8] + vp[12];
    const cy = x * vp[1] + y * vp[5] + z * vp[9] + vp[13];
    const cz = x * vp[2] + y * vp[6] + z * vp[10] + vp[14];
    const cw = x * vp[3] + y * vp[7] + z * vp[11] + vp[15];

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Perspective: w carries the view depth (sign already folded in for either
    // handedness), so w > 0 means in front. Orthographic: w is 1 everywhere and
    // the projection has no perspective term in entry 11.
    const perspective = proj[11] !== 0;

    let inFront: boolean;
    let ndcX: number;
    let ndcY: number;

    if (perspective) {
        inFront = cw > 0;
        // Behind the camera, dividing by a negative w mirrors the point; use |w|
        // so x/y still point in the right direction for an off-screen arrow.
        const w = Math.abs(cw) > 1e-12 ? Math.abs(cw) : 1e-12;
        ndcX = cx / w;
        ndcY = cy / w;
    } else {
        // Ortho: clip z = a*viewZ + proj[14], so proj[14] is clip z at the camera
        // plane. Whichever of near/far maps to clip z = +1 (GL, WebGPU, reversed
        // depth alike) lies in front, so "in front" is the side of proj[14] that
        // +1 is on.
        const atCamera = proj[14];
        inFront = (cz - atCamera) * (1 - atCamera) > 0;
        const w = cw !== 0 ? cw : 1;
        ndcX = cx / w;
        ndcY = cy / w;
    }

    const sx = ((ndcX + 1) / 2) * width;
    const sy = ((1 - ndcY) / 2) * height;

    const inside = ndcX >= -1 && ndcX <= 1 && ndcY >= -1 && ndcY <= 1;

    return { x: sx, y: sy, visible: inFront && inside };
}
