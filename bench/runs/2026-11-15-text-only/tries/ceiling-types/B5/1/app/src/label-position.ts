import type { Camera } from "@babylonjs/lite";
import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";

/**
 * Where a world-space point appears on the canvas, in CSS pixels from the
 * canvas's top-left corner.
 *
 * `visible` is true when the point is in front of the camera and inside the
 * picture. The far clipping plane is deliberately ignored, so distant terrain
 * beyond `camera.farPlane` still counts as visible. Points in front of the
 * camera but outside the picture keep their extrapolated `x`/`y` (past the
 * edge) so they can be used to place an edge arrow. Points behind the camera
 * are never visible.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    if (backingWidth <= 0 || backingHeight <= 0 || cssWidth <= 0 || cssHeight <= 0) {
        return { x: NaN, y: NaN, visible: false };
    }

    // Use the same viewport and aspect ratio the renderer uses for this camera.
    const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);

    // Under floating origin the view matrix is camera-relative (translation
    // zeroed), so tell the projector which world point the matrices' origin is.
    const worldOrigin = camera._useFloatingOrigin ? getCameraPosition(camera) : undefined;

    const r = projectWorldToScreen(point, view, viewProjection, {
        viewport,
        backingWidth,
        backingHeight,
        worldOrigin,
        cssWidth,
        cssHeight,
    });

    // `clipped` would also reject points past the far plane, so it is not used.
    // `offscreen` covers the 2D picture rectangle (and negative clip W).
    const finite = Number.isFinite(r.cssX) && Number.isFinite(r.cssY);
    const visible = finite && !r.behindCamera && !r.offscreen;

    return { x: r.cssX, y: r.cssY, visible };
}
