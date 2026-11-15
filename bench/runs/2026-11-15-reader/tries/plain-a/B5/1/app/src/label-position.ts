import {
    getViewMatrix,
    getViewProjectionMatrix,
    getCameraPosition,
    projectWorldToScreenToRef,
    type Camera,
    type ScreenProjectionResult,
} from "@babylonjs/lite";

/** Reused scratch result so label updates allocate nothing per call. */
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
 * Where a world-space point appears over a canvas that the camera renders into in full.
 *
 * `x` and `y` are CSS pixels from the canvas's top-left corner, not clamped to the canvas.
 * `visible` is true when the point is in front of the camera and inside the picture. Depth
 * clipping (near/far planes) is ignored, so distant points beyond the far plane still count.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    if (!(backingWidth > 0) || !(backingHeight > 0)) {
        return { x: Number.NaN, y: Number.NaN, visible: false };
    }

    // The camera renders into the whole canvas, so the viewport is the full backing store
    // and the aspect ratio is the canvas's own.
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, backingWidth / backingHeight);

    // Floating-origin (LWR) cameras use eye-relative matrices, so the point must be rebased
    // onto the camera position. The camera's own flag decides whether getViewMatrix does this.
    const worldOrigin = camera._useFloatingOrigin ? getCameraPosition(camera) : undefined;

    // CSS size is the canvas's laid-out size. If the canvas is not displayed, fall back to
    // backing-pixel coordinates rather than failing the projection's size validation.
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const hasCss = cssWidth > 0 && cssHeight > 0;

    projectWorldToScreenToRef(
        point,
        view,
        viewProjection,
        {
            viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
            backingWidth,
            backingHeight,
            worldOrigin,
            cssWidth: hasCss ? cssWidth : undefined,
            cssHeight: hasCss ? cssHeight : undefined,
        },
        scratch,
    );

    // `offscreen` is set for points behind the camera, with negative clip W, non-finite
    // results, or NDC x/y outside [-1, 1]. It ignores depth (near/far) clipping by design.
    return { x: scratch.cssX, y: scratch.cssY, visible: !scratch.offscreen };
}
