import { getProjectionMatrix, getViewMatrix } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/**
 * Project a world-space point to CSS pixels on the canvas.
 *
 * - x / y: where the point lands, in CSS pixels from the canvas's top-left corner.
 *   Points outside the picture still get their (off-screen) position, so they can
 *   drive an edge arrow.
 * - visible: the point is in front of the camera (view-space +Z > 0) and inside the
 *   picture. The far clipping distance is ignored, so distant points can be visible.
 *
 * The camera is assumed to render to the whole canvas. Its `viewport` is not applied.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    // The renderer's aspect comes from the drawing buffer, not the CSS box.
    const aspect = canvas.height > 0 ? canvas.width / canvas.height : 1;
    const view = getViewMatrix(camera);
    const proj = getProjectionMatrix(camera, aspect);

    // Mat4 is column-major: element (row r, column c) is m[c * 4 + r].
    const vx = view[0] * point.x + view[4] * point.y + view[8] * point.z + view[12];
    const vy = view[1] * point.x + view[5] * point.y + view[9] * point.z + view[13];
    const vz = view[2] * point.x + view[6] * point.y + view[10] * point.z + view[14];

    const cx = proj[0] * vx + proj[4] * vy + proj[8] * vz + proj[12];
    const cy = proj[1] * vx + proj[5] * vy + proj[9] * vz + proj[13];
    const cw = proj[3] * vx + proj[7] * vy + proj[11] * vz + proj[15];

    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;

    // Perspective: cw equals vz. Orthographic: cw is 1. Using |cw| keeps the
    // on-screen direction sensible for points behind the camera.
    const denom = Math.abs(cw);
    if (!(denom > 1e-12)) {
        return { x: cssW / 2, y: cssH / 2, visible: false };
    }

    const ndcX = cx / denom;
    const ndcY = cy / denom;

    const x = (ndcX * 0.5 + 0.5) * cssW;
    const y = (0.5 - ndcY * 0.5) * cssH;

    // Depth is not clipped against the far plane. Only "in front" and "in the picture" count.
    const visible = vz > 0 && Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1;

    return { x, y, visible };
}
