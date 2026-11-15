import type { Camera } from "@babylonjs/lite";
import { getViewMatrix, getViewProjectionMatrix } from "@babylonjs/lite";

export interface LabelPosition {
    /** CSS pixels from the canvas's left edge. May lie outside [0, width] when off-screen. */
    x: number;
    /** CSS pixels from the canvas's top edge. May lie outside [0, height] when off-screen. */
    y: number;
    /** In front of the camera, not closer than the near plane, and inside the picture. */
    visible: boolean;
}

/**
 * Projects a world-space point to CSS pixel coordinates over a canvas that the camera
 * renders to in full.
 *
 * - Depth is not clipped against the far plane, so distant points still count as visible.
 * - Points behind the camera are never visible. Their x/y are still computed from the
 *   magnitude of the clip-space w so that the direction toward them is meaningful for an arrow.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): LabelPosition {
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    // The render target's aspect ratio is taken from the drawing buffer, not the CSS size.
    const aspect = canvas.width > 0 && canvas.height > 0 ? canvas.width / canvas.height : 1;

    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    const { x, y, z } = point;

    // View-space depth (left-handed: +Z is forward). Works for perspective and orthographic.
    const depth = view[2] * x + view[6] * y + view[10] * z + view[14];

    // Clip-space coordinates. Column-major: element (row r, column c) is m[c * 4 + r].
    const clipX = viewProjection[0] * x + viewProjection[4] * y + viewProjection[8] * z + viewProjection[12];
    const clipY = viewProjection[1] * x + viewProjection[5] * y + viewProjection[9] * z + viewProjection[13];
    const clipW = viewProjection[3] * x + viewProjection[7] * y + viewProjection[11] * z + viewProjection[15];

    const absW = Math.abs(clipW);
    if (!(absW > 1e-12)) {
        // Degenerate projection (point on the camera plane). Nothing sensible to place.
        return { x: cssWidth / 2, y: cssHeight / 2, visible: false };
    }

    const ndcX = clipX / absW;
    const ndcY = clipY / absW;

    const screenX = (ndcX * 0.5 + 0.5) * cssWidth;
    // NDC y points up, CSS y points down.
    const screenY = (0.5 - ndcY * 0.5) * cssHeight;

    const inFront = depth > 0 && depth >= camera.nearPlane;
    const inPicture = Math.abs(ndcX) <= 1 && Math.abs(ndcY) <= 1;

    return { x: screenX, y: screenY, visible: inFront && inPicture };
}
