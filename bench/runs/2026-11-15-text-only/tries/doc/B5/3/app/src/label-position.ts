import type { Camera } from "@babylonjs/lite";
import { getProjectionMatrix, getViewMatrix } from "@babylonjs/lite";

/**
 * Project a world-space point to CSS pixels over a full-canvas camera view.
 *
 * - `x` / `y`: where the point lands, in CSS pixels from the canvas's top-left corner.
 *   For points outside the picture these are unclamped, so they can be used to
 *   place an off-screen arrow.
 * - `visible`: the point is in front of the camera (view-space z > 0) and inside the
 *   picture. The far clipping distance is deliberately ignored.
 *
 * Matrices are the library's own (camera-to-world inverted to view, then the
 * left-handed reverse-Z projection, perspective or orthographic), so the result
 * follows whatever projection the camera currently uses.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    // The projection must use the render target's aspect ratio (drawing buffer),
    // while pixel mapping uses the element's CSS box.
    const bufferHeight = canvas.height;
    const aspect = bufferHeight > 0 ? canvas.width / bufferHeight : 1;

    const view = getViewMatrix(camera);
    const proj = getProjectionMatrix(camera, aspect);

    // World -> view space (column-major, translation in elements 12..14).
    const px = point.x;
    const py = point.y;
    const pz = point.z;
    const vx = view[0] * px + view[4] * py + view[8] * pz + view[12];
    const vy = view[1] * px + view[5] * py + view[9] * pz + view[13];
    const vz = view[2] * px + view[6] * py + view[10] * pz + view[14];

    // View -> clip. For perspective, clip w equals vz; for orthographic, w is 1.
    const cx = proj[0] * vx + proj[4] * vy + proj[8] * vz + proj[12];
    const cy = proj[1] * vx + proj[5] * vy + proj[9] * vz + proj[13];
    const cw = proj[3] * vx + proj[7] * vy + proj[11] * vz + proj[15];

    // Perspective divide. Behind the camera cw is negative, so use its magnitude
    // so the lateral direction stays correct for an arrow; such points are never visible.
    const denom = Math.max(Math.abs(cw), 1e-12);
    const ndcX = cx / denom;
    const ndcY = cy / denom;

    // NDC -> CSS pixels (NDC y points up, CSS y points down).
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const x = ((ndcX + 1) / 2) * width;
    const y = ((1 - ndcY) / 2) * height;

    const inFront = vz > 0;
    const inPicture = x >= 0 && x <= width && y >= 0 && y <= height;

    return { x, y, visible: inFront && inPicture };
}
