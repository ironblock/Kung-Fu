import { getViewMatrix } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

export interface LabelPosition {
    /** CSS pixels from the canvas's left edge. May lie outside the canvas. */
    x: number;
    /** CSS pixels from the canvas's top edge. May lie outside the canvas. */
    y: number;
    /** In front of the camera and inside the picture. Never true behind the camera. */
    visible: boolean;
}

/**
 * Where a world-space point appears on a perspective-rendered canvas.
 *
 * The far clipping plane is deliberately ignored, so distant points still count
 * as visible. Only the near side (z > 0 in view space) and the picture edges
 * decide visibility.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number }
): LabelPosition {
    if (camera.ortho) {
        throw new Error("labelPosition: orthographic cameras are not supported");
    }

    // World -> view space. Assumes Babylon's row-vector layout, translation in m[12..14].
    const m = getViewMatrix(camera);
    const vx = point.x * m[0] + point.y * m[4] + point.z * m[8] + m[12];
    const vy = point.x * m[1] + point.y * m[5] + point.z * m[9] + m[13];
    const vz = point.x * m[2] + point.y * m[6] + point.z * m[10] + m[14];

    // Half-extents of the view at depth z: fov is vertical, aspect is the render target's.
    const aspect = canvas.width / canvas.height;
    const tanHalfFov = Math.tan(camera.fov / 2);

    const inFront = vz > 0;
    // For points behind the camera the x/y values are not meaningful; keep the
    // divisor non-zero so the result is finite.
    const depth = inFront ? vz : Math.max(-vz, 1e-9);

    // Normalized device coordinates in [-1, 1] across the picture.
    const ndcX = vx / (depth * tanHalfFov * aspect);
    const ndcY = vy / (depth * tanHalfFov);

    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    return {
        x: ((ndcX + 1) / 2) * cssWidth,
        y: ((1 - ndcY) / 2) * cssHeight,
        visible: inFront && Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1,
    };
}
