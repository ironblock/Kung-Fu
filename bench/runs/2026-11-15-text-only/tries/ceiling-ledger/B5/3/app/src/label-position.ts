import type { Camera } from "@babylonjs/lite";
import { getViewProjectionMatrix } from "@babylonjs/lite";

/**
 * Where a world-space point lands on the canvas, in CSS pixels from the
 * canvas's top-left corner, for placing an HTML label over the 3D view.
 *
 * `visible` is true when the point is in front of the camera and inside the
 * picture. Depth is deliberately not clipped: points beyond the far plane (or
 * nearer than the near plane) still count as visible. For a point outside the
 * picture, `x`/`y` still give where it would be, past the edge. For a point
 * behind the camera, `x`/`y` keep the point's sideways direction (no mirror
 * flip), so they can drive an edge arrow, but `visible` is always false.
 *
 * The view-projection matrix is read through the library getter on every
 * call. The getter polls the camera's change key, so fov / nearPlane /
 * farPlane writes made since the last frame are picked up here too.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    const vp = getViewProjectionMatrix(camera) as unknown;
    // Accept a bare 16-element array or a Matrix-like object with `.m`.
    const m = ((vp as { m?: ArrayLike<number> }).m ?? vp) as ArrayLike<number>;

    const { x, y, z } = point;
    // Babylon memory layout (row vector times matrix, translation in 12..14),
    // which is the same as column-major with column vectors.
    const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
    const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
    const cz = m[2] * x + m[6] * y + m[10] * z + m[14];
    const cw = m[3] * x + m[7] * y + m[11] * z + m[15];

    const affine = Math.abs(m[3]) + Math.abs(m[7]) + Math.abs(m[11]) < 1e-12;

    let inFront: boolean;
    if (!affine) {
        // Perspective: clip w is the depth along the view direction.
        inFront = cw > 0;
    } else {
        // Orthographic: w is constant, so recover view depth from clip z,
        // assuming the standard WebGPU [0, 1] depth range (near -> 0, far -> 1).
        const n = camera.nearPlane;
        const f = camera.farPlane;
        const ndcZ = cz / cw;
        const depth = n + ndcZ * (f - n);
        inFront = depth > 0;
    }

    // Divide by |w| so a point behind the camera keeps its sideways direction.
    const aw = Math.max(Math.abs(cw), 1e-12);
    const ndcX = cx / aw;
    const ndcY = cy / aw;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    return {
        x: (ndcX + 1) * 0.5 * width,
        y: (1 - ndcY) * 0.5 * height,
        visible: inFront && Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1,
    };
}
