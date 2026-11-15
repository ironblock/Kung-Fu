import type { Camera } from "@babylonjs/lite";

export interface LabelPosition {
    /** CSS pixels from the canvas's left edge. May lie outside the canvas. */
    x: number;
    /** CSS pixels from the canvas's top edge. May lie outside the canvas. */
    y: number;
    /** True when the point is in front of the camera and inside the picture. */
    visible: boolean;
}

/** 16 numbers, Babylon convention: row-major, row-vector math (v * M), translation in elements 12..14. */
type Mat4 = ArrayLike<number>;

/**
 * ASSUMPTION (unverified: Babylon Lite 1.39.0 is not available on this machine).
 * This is the only place that depends on the Camera API. If Babylon Lite exposes the
 * matrices under other names or a different layout, change this helper only.
 */
interface CameraMatrices {
    getViewMatrix(): Mat4;
    getProjectionMatrix(): Mat4;
}

function cameraMatrices(camera: Camera): { view: Mat4; projection: Mat4 } {
    const c = camera as unknown as CameraMatrices;
    return { view: c.getViewMatrix(), projection: c.getProjectionMatrix() };
}

/** Row-vector transform of (x, y, z, 1) by a row-major 4x4 matrix, returning homogeneous (x, y, z, w). */
function transform(x: number, y: number, z: number, m: Mat4): [number, number, number, number] {
    return [
        x * m[0] + y * m[4] + z * m[8] + m[12],
        x * m[1] + y * m[5] + z * m[9] + m[13],
        x * m[2] + y * m[6] + z * m[10] + m[14],
        x * m[3] + y * m[7] + z * m[11] + m[15],
    ];
}

/**
 * Projects a world-space point to CSS pixel coordinates over a canvas that the camera
 * renders to in full. `visible` is true when the point is in front of the camera and inside
 * the picture. Depth is not tested against the far (or near) clipping planes, so distant
 * points still count as visible. Points behind the camera are never visible; their x/y are
 * whatever the projection yields and should not be used.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): LabelPosition {
    const { view, projection } = cameraMatrices(camera);

    // World -> view space. In Babylon's left-handed convention the camera looks down +z,
    // so a point is in front of the camera when viewZ is positive. This test works for both
    // perspective and orthographic cameras, where clip w is not a usable depth test.
    const [vx, vy, vz] = transform(point.x, point.y, point.z, view);

    // View -> clip space. For a perspective camera clip w equals viewZ; the extra cw > 0
    // check guards against a projection whose w does not follow that convention.
    const [cx, cy, , cw] = transform(vx, vy, vz, projection);

    const front = vz > 0 && cw > 0;

    // Normalized device coordinates: x and y in [-1, 1] when inside the picture.
    // Divide by w; if w is exactly zero the projection is degenerate and we return NaN.
    const ndcX = cw !== 0 ? cx / cw : NaN;
    const ndcY = cw !== 0 ? cy / cw : NaN;

    // The camera renders to the whole canvas, so NDC maps to the CSS box of the canvas.
    // Y is flipped because NDC y points up and CSS y points down.
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const x = (ndcX * 0.5 + 0.5) * width;
    const y = (0.5 - ndcY * 0.5) * height;

    const visible = front && Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1;

    return { x, y, visible };
}
