import type { Camera } from "@babylonjs/lite";

/**
 * Where a world-space point lands on the canvas.
 *
 * x, y: CSS pixels from the canvas's top-left corner. Valid for any point in
 *       front of the camera, including points outside the picture (for arrows).
 *       Not meaningful for points behind the camera.
 * visible: the point is in front of the camera and inside the picture.
 *          The far clipping distance is ignored on purpose.
 */
export interface LabelPosition {
    x: number;
    y: number;
    visible: boolean;
}

type Vec4 = [number, number, number, number];

/**
 * Multiplies a homogeneous row vector by a 4x4 matrix stored as 16 numbers in
 * Babylon's row-vector layout: result = v * M, with translation in m[12..14].
 */
function transformRow(v: Vec4, m: ArrayLike<number>): Vec4 {
    const [x, y, z, w] = v;
    return [
        x * m[0] + y * m[4] + z * m[8] + w * m[12],
        x * m[1] + y * m[5] + z * m[9] + w * m[13],
        x * m[2] + y * m[6] + z * m[10] + w * m[14],
        x * m[3] + y * m[7] + z * m[11] + w * m[15],
    ];
}

export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): LabelPosition {
    // Assumed Babylon-style accessors. Verify against Babylon Lite 1.39.0 Camera.
    const view = camera.getViewMatrix();
    const projection = camera.getProjectionMatrix();

    // Clip-space position: world -> view -> projection.
    const clip = transformRow(
        transformRow([point.x, point.y, point.z, 1], view),
        projection,
    );
    const w = clip[3];

    // In Babylon's left-handed projection, w equals view-space depth, so w > 0
    // means in front of the camera. Only the sign of w is used; z is never
    // tested, so points beyond the far plane are not clipped away.
    const inFront = Number.isFinite(w) && w > 0;

    // Perspective divide. For points behind the camera this is meaningless,
    // so the result is only reported as not visible.
    const ndcX = clip[0] / w;
    const ndcY = clip[1] / w;

    // NDC covers the whole canvas (the camera renders to all of it).
    // Use CSS size, not the backing-store size, so the result is in CSS pixels.
    // NDC y points up; screen y points down.
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const x = ((ndcX + 1) / 2) * cssWidth;
    const y = ((1 - ndcY) / 2) * cssHeight;

    const inPicture = Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1;

    return { x, y, visible: inFront && inPicture };
}
