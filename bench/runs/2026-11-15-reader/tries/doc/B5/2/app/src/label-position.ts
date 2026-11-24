import { getCameraPosition, getViewMatrix, getViewProjectionMatrix } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

/**
 * Where a world-space point lands on the canvas, for placing an HTML label.
 *
 * - `x`, `y`: CSS pixels from the canvas's top-left corner. The camera renders to the
 *   whole canvas, so the NDC square maps onto the canvas's CSS box. For a point outside
 *   the picture these are where it would be, past the edge (usable for an arrow). For a
 *   point behind the camera they are the projective result and not meaningful as a
 *   direction; `visible` is false there. NaN only when the point projects to infinity.
 * - `visible`: the point is in front of the camera (view-space Z > 0) and inside the
 *   picture horizontally and vertically. Depth is not clipped, so points beyond the far
 *   plane still count as visible.
 */
export function labelPosition(camera: Camera, canvas: HTMLCanvasElement, point: { x: number; y: number; z: number }): { x: number; y: number; visible: boolean } {
    // Under floating origin (LWR) the view matrix has no translation column: the scene is
    // seen relative to the eye. Make the point eye-relative too so both agree.
    let px = point.x;
    let py = point.y;
    let pz = point.z;
    if (camera._useFloatingOrigin === true) {
        const eye = getCameraPosition(camera);
        px -= eye.x;
        py -= eye.y;
        pz -= eye.z;
    }

    const aspect = canvas.width / canvas.height;
    const v = getViewMatrix(camera);
    const viewZ = px * v[2]! + py * v[6]! + pz * v[10]! + v[14]!;

    const vp = getViewProjectionMatrix(camera, aspect);
    const clipX = px * vp[0]! + py * vp[4]! + pz * vp[8]! + vp[12]!;
    const clipY = px * vp[1]! + py * vp[5]! + pz * vp[9]! + vp[13]!;
    const clipW = px * vp[3]! + py * vp[7]! + pz * vp[11]! + vp[15]!;

    if (!Number.isFinite(viewZ) || !Number.isFinite(clipX) || !Number.isFinite(clipY) || !Number.isFinite(clipW) || clipW === 0) {
        return { x: Number.NaN, y: Number.NaN, visible: false };
    }

    const ndcX = clipX / clipW;
    const ndcY = clipY / clipW;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    const x = ((ndcX + 1) * 0.5) * cssWidth;
    const y = ((1 - ndcY) * 0.5) * cssHeight;
    const inFront = viewZ > 0;
    const inPicture = Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1;

    return { x, y, visible: inFront && inPicture };
}
