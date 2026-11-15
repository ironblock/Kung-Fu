import type { Camera } from "@babylonjs/lite";
import { getViewMatrix } from "@babylonjs/lite";

export interface LabelPosition {
    /** CSS pixels from the canvas's left edge. May lie outside [0, width] when off-screen. */
    x: number;
    /** CSS pixels from the canvas's top edge. May lie outside [0, height] when off-screen. */
    y: number;
    /** True when the point is in front of the camera and inside the picture. */
    visible: boolean;
}

/**
 * Projects a world-space point to CSS pixel coordinates over the canvas.
 *
 * The far clipping plane is deliberately ignored, so points beyond `farPlane`
 * still project and can be visible. Points behind the camera are never visible;
 * their x/y are not meaningful.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number }
): LabelPosition {
    if (camera.ortho) {
        // Orthographic projection is not implemented here.
        throw new Error("labelPosition: orthographic cameras are not supported");
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const aspect = width / height;

    // View matrix, column-major (translation in elements 12..14), as in Babylon.
    const m = getViewMatrix(camera) as unknown as ArrayLike<number>;
    const vx = m[0] * point.x + m[4] * point.y + m[8] * point.z + m[12];
    const vy = m[1] * point.x + m[5] * point.y + m[9] * point.z + m[13];
    const vz = m[2] * point.x + m[6] * point.y + m[10] * point.z + m[14];

    // Left-handed view space: +z is forward. Points with vz <= 0 are behind the camera.
    const inFront = vz > 0;

    // camera.fov is the vertical field of view in radians.
    const tanHalfFov = Math.tan(camera.fov / 2);
    const ndcX = vx / (vz * tanHalfFov * aspect);
    const ndcY = vy / (vz * tanHalfFov);

    // NDC (+y up) to CSS pixels (+y down).
    const x = ((ndcX + 1) / 2) * width;
    const y = ((1 - ndcY) / 2) * height;

    const inside = x >= 0 && x <= width && y >= 0 && y <= height;

    return { x, y, visible: inFront && inside };
}
