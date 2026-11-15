import type { Camera, ScreenProjectionOptions, ScreenProjectionResult } from "@babylonjs/lite";
import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreenToRef,
    resolveCameraViewport,
} from "@babylonjs/lite";

/** Reused for every call so placing many labels per frame allocates nothing for the projection. */
const scratch: ScreenProjectionResult = {
    x: 0,
    y: 0,
    z: 0,
    cssX: 0,
    cssY: 0,
    clipW: 0,
    behindCamera: false,
    clipped: false,
    offscreen: false,
};

/**
 * Where a world-space point appears on the canvas, in CSS pixels from the canvas's top-left corner.
 *
 * `visible` is true when the point is in front of the camera and inside the picture. Depth clipping is
 * deliberately ignored, so points beyond the far plane (distant terrain) still count as visible. Points
 * in front of the camera but outside the picture are not visible, but `x`/`y` still give their
 * extrapolated position past the edge (useful for edge arrows). Points behind the camera are never
 * visible, and their `x`/`y` carry no meaning.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    // The renderer draws into the backing store; labels are placed in CSS pixels.
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    if (!(backingWidth > 0 && backingHeight > 0 && cssWidth > 0 && cssHeight > 0)) {
        // Nothing is drawn on a zero-sized canvas, and the projection would divide by zero.
        return { x: 0, y: 0, visible: false };
    }

    // Use the same aspect ratio and viewport the renderer uses for this camera.
    const aspectRatio = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspectRatio);

    const options: ScreenProjectionOptions = {
        viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
    };

    // With floating origin (large-world rendering), getViewMatrix zeroes the view translation, so the
    // matrices are eye-relative: their origin is the camera's world position, not the world origin.
    if (camera._useFloatingOrigin) {
        const eye = getCameraPosition(camera);
        options.worldOrigin = { x: eye.x, y: eye.y, z: eye.z };
    }

    const projected = projectWorldToScreenToRef(point, view, viewProjection, options, scratch);
    const x = projected.cssX;
    const y = projected.cssY;

    // `clipped` would also reject points past the near/far planes, so it is not used. `offscreen` only
    // tests the 2D picture rectangle, and `behindCamera` uses view-space depth, which also works for
    // orthographic cameras.
    const visible =
        !projected.behindCamera && !projected.offscreen && Number.isFinite(x) && Number.isFinite(y);

    return { x, y, visible };
}
