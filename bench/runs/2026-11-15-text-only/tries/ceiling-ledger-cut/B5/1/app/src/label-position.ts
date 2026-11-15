import { getProjectionMatrix, getViewMatrix } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/**
 * Where a world-space point appears on the canvas, for placing an HTML label.
 *
 * - `x`, `y`: CSS pixels from the canvas's top-left corner. Still filled in
 *   when the point is off-screen, so the caller can point an arrow at it.
 * - `visible`: the point is in front of the camera and inside the picture.
 *   Depth is deliberately ignored, so points beyond the far plane (distant
 *   terrain) still count as visible.
 *
 * Matrices are taken from the library (Babylon layout: row vectors, translation
 * in elements 12..14, left-handed view with the camera looking down +z), so
 * perspective, orthographic and every camera kind go through the same code.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    const v = elements(getViewMatrix(camera));
    const p = elements(getProjectionMatrix(camera));

    const { x, y, z } = point;

    // View space (row vector times view matrix).
    const vx = x * v[0] + y * v[4] + z * v[8] + v[12];
    const vy = x * v[1] + y * v[5] + z * v[9] + v[13];
    const vz = x * v[2] + y * v[6] + z * v[10] + v[14];
    const vw = x * v[3] + y * v[7] + z * v[11] + v[15];

    // Clip space. z is not needed: the far (and near) plane must not hide labels.
    const cx = vx * p[0] + vy * p[4] + vz * p[8] + vw * p[12];
    const cy = vx * p[1] + vy * p[5] + vz * p[9] + vw * p[13];
    const cw = vx * p[3] + vy * p[7] + vz * p[11] + vw * p[15];

    // In front of the camera: positive view-space depth (left-handed, +z forward).
    // This works for both perspective (where cw equals vz) and orthographic (cw is 1).
    const inFront = vz / vw > 0;

    // Avoid dividing by zero for a point exactly in the camera plane.
    const w = Math.abs(cw) < 1e-12 ? (cw < 0 ? -1e-12 : 1e-12) : cw;
    const ndcX = cx / w;
    const ndcY = cy / w;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    return {
        x: ((ndcX + 1) / 2) * width,
        y: ((1 - ndcY) / 2) * height,
        visible:
            inFront &&
            Number.isFinite(ndcX) &&
            Number.isFinite(ndcY) &&
            ndcX >= -1 &&
            ndcX <= 1 &&
            ndcY >= -1 &&
            ndcY <= 1,
    };
}

/** Accept either a 16-element array-like or a matrix object holding one in `m`. */
function elements(matrix: unknown): ArrayLike<number> {
    const maybe = matrix as { m?: ArrayLike<number> } & ArrayLike<number>;
    if (maybe && typeof maybe.length === "number" && maybe.length >= 16) return maybe;
    if (maybe && maybe.m && maybe.m.length >= 16) return maybe.m;
    throw new TypeError("labelPosition: expected a 4x4 matrix from @babylonjs/lite");
}
