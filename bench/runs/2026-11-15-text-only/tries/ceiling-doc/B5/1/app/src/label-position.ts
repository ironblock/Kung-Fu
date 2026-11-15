import type { Camera } from "@babylonjs/lite";
import { getProjectionMatrix, getViewMatrix } from "@babylonjs/lite";

/**
 * Where a world-space point appears on the canvas, in CSS pixels from the
 * canvas's top-left corner.
 *
 * Conventions (from the Babylon Lite camera notes):
 * - Left-handed: in view space the camera looks down +Z, so "in front" is viewZ > 0.
 * - Matrices are Babylon-style (translation in m[12..14]); a point transforms as a
 *   row vector, e.g. out.x = x*m[0] + y*m[4] + z*m[8] + m[12].
 * - Projection uses reverse-Z depth, with farPlane mapping to 0. We never test
 *   depth, so points past farPlane still count as visible.
 * - Works for perspective (w = viewZ) and orthographic (w = 1) projections.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    // CSS size of the canvas, used for the output coordinates.
    const cssWidth = canvas.clientWidth || canvas.width;
    const cssHeight = canvas.clientHeight || canvas.height;

    // The renderer builds its projection from the drawing-buffer aspect ratio.
    const bufWidth = canvas.width || cssWidth;
    const bufHeight = canvas.height || cssHeight;
    const aspect = bufHeight > 0 ? bufWidth / bufHeight : 1;

    const v = getViewMatrix(camera);
    const p = getProjectionMatrix(camera, aspect);

    // World -> view.
    const { x, y, z } = point;
    const vx = x * v[0] + y * v[4] + z * v[8] + v[12];
    const vy = x * v[1] + y * v[5] + z * v[9] + v[13];
    const vz = x * v[2] + y * v[6] + z * v[10] + v[14];

    // View -> clip. Only x, y and w are needed; depth is ignored on purpose.
    const cx = vx * p[0] + vy * p[4] + vz * p[8] + p[12];
    const cy = vx * p[1] + vy * p[5] + vz * p[9] + p[13];
    const cw = vx * p[3] + vy * p[7] + vz * p[11] + p[15];

    const inFront = vz > 0;

    // Perspective divide. For points behind a perspective camera w is negative,
    // which mirrors the result; those points are never visible anyway.
    const w = Math.abs(cw) > 1e-12 ? cw : cw < 0 ? -1e-12 : 1e-12;
    const ndcX = cx / w;
    const ndcY = cy / w;

    // NDC y points up; CSS y points down.
    const sx = (ndcX + 1) * 0.5 * cssWidth;
    const sy = (1 - ndcY) * 0.5 * cssHeight;

    const inside = ndcX >= -1 && ndcX <= 1 && ndcY >= -1 && ndcY <= 1;

    return { x: sx, y: sy, visible: inFront && inside };
}
