import {
    getCameraPosition,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreenToRef,
    type Camera,
    type ScreenProjectionOptions,
    type ScreenProjectionResult,
} from "@babylonjs/lite";

/** Reused across calls so a label update does not allocate projection results. */
const projected: ScreenProjectionResult = {
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
 * Where a world-space point appears on a canvas, in CSS pixels from the canvas's top-left corner.
 *
 * The camera renders to the whole canvas, so the picture is the full backing store and the
 * aspect ratio is canvas.width / canvas.height. `camera.viewport` is deliberately not applied.
 *
 * `visible` is true when the point is in front of the camera and inside the picture. Depth is
 * not checked against the near or far planes, so points beyond `farPlane` are still visible.
 * Points in front of the camera but outside the picture get `x` and `y` past the edge, for
 * arrows. Points behind the camera are never visible.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    if (!(backingWidth > 0) || !(backingHeight > 0)) {
        return { x: 0, y: 0, visible: false };
    }

    const rect = canvas.getBoundingClientRect();
    const options: ScreenProjectionOptions = {
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        // Without layout the CSS size is unknown. Falling back to one CSS pixel per backing pixel
        // keeps the function usable before the canvas is in the DOM.
        ...(rect.width > 0 && rect.height > 0 ? { cssWidth: rect.width, cssHeight: rect.height } : {}),
        // Under floating origin the view matrix has no translation, so it is relative to the
        // camera position. The point is absolute, so the origin must be passed.
        ...(camera._useFloatingOrigin ? { worldOrigin: getCameraPosition(camera) } : {}),
    };

    const aspect = backingWidth / backingHeight;
    projectWorldToScreenToRef(point, getViewMatrix(camera), getViewProjectionMatrix(camera, aspect), options, projected);

    return { x: projected.cssX, y: projected.cssY, visible: !projected.offscreen };
}
