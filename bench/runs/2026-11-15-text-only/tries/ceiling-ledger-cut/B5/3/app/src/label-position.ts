import type { Camera } from "@babylonjs/lite";
import { getViewProjectionMatrix } from "@babylonjs/lite";

/**
 * Where a world-space point appears on the canvas, in CSS pixels from the
 * canvas's top-left corner.
 *
 * - `visible` is true when the point is in front of the camera and inside the
 *   picture. Depth is deliberately ignored, so points past the far clipping
 *   distance (distant mountains) still count as visible.
 * - A point in front of the camera but outside the picture is not visible; `x`
 *   and `y` still give where it would be, past the edge.
 * - A point behind the camera is never visible. Its `x`/`y` are projected
 *   with |w| so they point the way the camera would have to turn, which is
 *   the useful direction for an edge arrow.
 *
 * Assumes the camera renders to the whole canvas (camera.viewport is ignored)
 * and a perspective camera (see notes in the report for orthographic and
 * floating-origin cameras).
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    // Babylon layout: row-vector convention, translation in m[12..14].
    // Read through the library getter so the change key keeps it fresh.
    const m = getViewProjectionMatrix(camera) as ArrayLike<number>;

    const { x, y, z } = point;
    const cx = x * m[0] + y * m[4] + z * m[8] + m[12];
    const cy = x * m[1] + y * m[5] + z * m[9] + m[13];
    const cw = x * m[3] + y * m[7] + z * m[11] + m[15];

    // Perspective clip w is the view-space distance along the camera's
    // forward axis: positive in front, negative behind.
    const inFront = cw > 1e-6;
    const w = Math.max(Math.abs(cw), 1e-6);

    const ndcX = cx / w;
    const ndcY = cy / w;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const sx = (ndcX + 1) * 0.5 * width;
    const sy = (1 - ndcY) * 0.5 * height;

    // Only x/y are tested: clip z (near/far) is ignored on purpose.
    const inside = ndcX >= -1 && ndcX <= 1 && ndcY >= -1 && ndcY <= 1;

    return { x: sx, y: sy, visible: inFront && inside };
}
