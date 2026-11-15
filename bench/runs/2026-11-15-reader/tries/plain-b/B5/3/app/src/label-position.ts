import type { Camera } from "@babylonjs/lite";
import { getCameraPosition, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

/**
 * Where a world-space point lands on the canvas, for placing an HTML label.
 *
 * `x` and `y` are CSS pixels from the canvas's top-left corner. They are
 * extrapolated past the edges for points outside the picture, so they can
 * drive an edge arrow. `visible` is true when the point is in front of the
 * camera and inside the picture. Distance does not matter, so points beyond
 * the far clipping plane count as visible.
 */
export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number },
): { x: number; y: number; visible: boolean } {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, backingWidth / backingHeight);

    // Under floating origin the view matrix has no translation; the eye sits at the
    // camera's world position, so the point must be rebased onto that position.
    const floatingOrigin = camera._useFloatingOrigin === true;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const hasCssSize = cssWidth > 0 && cssHeight > 0;

    const projected = projectWorldToScreen(point, view, viewProjection, {
        // The camera renders to the whole canvas, so ignore any normalized camera viewport.
        viewport: { x: 0, y: 0, width: backingWidth, height: backingHeight },
        backingWidth,
        backingHeight,
        ...(floatingOrigin ? { worldOrigin: getCameraPosition(camera) } : {}),
        ...(hasCssSize ? { cssWidth, cssHeight } : {}),
    });

    // `offscreen` covers behind-camera, non-finite and outside-the-picture cases. It
    // ignores depth on purpose: `clipped` also flags points beyond the far plane, which
    // must remain visible. Behind-camera points are never visible.
    return { x: projected.cssX, y: projected.cssY, visible: !projected.offscreen };
}
