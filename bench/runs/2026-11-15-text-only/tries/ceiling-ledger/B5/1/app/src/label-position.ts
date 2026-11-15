import type { Camera } from "@babylonjs/lite";
import { getProjectionMatrix, getViewMatrix } from "@babylonjs/lite";

/**
 * Where a world-space point appears on the canvas, in CSS pixels from the
 * canvas's top-left corner.
 *
 * - `visible` is true when the point is in front of the camera and inside the
 *   picture. The far clipping distance is deliberately ignored: distant terrain
 *   beyond camera.farPlane still counts as visible.
 * - A point in front of the camera but outside the picture gets `visible: false`
 *   and an `x`/`y` past the canvas edge (useful for edge arrows).
 * - A point behind the camera is never visible. Its `x`/`y` are mirrored through
 *   the centre so they still point toward the side the point lies on.
 *
 * Assumes the camera renders to the whole canvas (camera.viewport is ignored).
 *
 * The library's own view and projection matrices are used, so the result follows
 * whatever projection is actually drawn (perspective, or orthographic when
 * enabled through enableOrthographicCamera). Matrices are Babylon-style: row
 * vectors, left-handed, with translation in elements 12..14 and the view
 * looking down +z.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    const view = elements(getViewMatrix(camera));
    const proj = elements(getProjectionMatrix(camera));

    const { x, y, z } = point;

    // World -> view space.
    const vx = x * view[0] + y * view[4] + z * view[8] + view[12];
    const vy = x * view[1] + y * view[5] + z * view[9] + view[13];
    const vz = x * view[2] + y * view[6] + z * view[10] + view[14];
    const vw = x * view[3] + y * view[7] + z * view[11] + view[15];

    // In front of the camera, judged in view space so it works for both
    // perspective (where clip w equals view z) and orthographic (where clip w is 1).
    const inFront = vz > 0;

    // View -> clip space. Only x, y and w are needed; clip z (and therefore the
    // near/far planes) is not used, so points beyond the far plane are not culled.
    const cx = vx * proj[0] + vy * proj[4] + vz * proj[8] + vw * proj[12];
    const cy = vx * proj[1] + vy * proj[5] + vz * proj[9] + vw * proj[13];
    let cw = vx * proj[3] + vy * proj[7] + vz * proj[11] + vw * proj[15];

    // For points behind the camera, divide by |w| so the result stays on the
    // side the point is on rather than flipping through the centre. Guard w == 0
    // (a point exactly in the camera's plane under perspective).
    cw = Math.abs(cw);
    if (cw < 1e-12) cw = 1e-12;

    const ndcX = cx / cw;
    const ndcY = cy / cw;

    // CSS pixel size of the canvas as laid out on the page.
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || canvas.clientWidth || canvas.width;
    const height = rect.height || canvas.clientHeight || canvas.height;

    const sx = (ndcX + 1) * 0.5 * width;
    const sy = (1 - ndcY) * 0.5 * height;

    const inside = ndcX >= -1 && ndcX <= 1 && ndcY >= -1 && ndcY <= 1;

    return { x: sx, y: sy, visible: inFront && inside && Number.isFinite(sx) && Number.isFinite(sy) };
}

/** Accepts either a raw 16-element array or a matrix object exposing it as `.m`. */
function elements(matrix: unknown): ArrayLike<number> {
    if (matrix && typeof matrix === "object" && "m" in matrix) {
        return (matrix as { m: ArrayLike<number> }).m;
    }
    return matrix as ArrayLike<number>;
}
