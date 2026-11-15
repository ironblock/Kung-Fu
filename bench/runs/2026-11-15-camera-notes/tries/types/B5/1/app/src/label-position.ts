import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
    type Camera,
} from "@babylonjs/lite";

/**
 * Where a world-space point appears over a canvas that the camera renders to.
 *
 * `x` / `y` are CSS pixels from the canvas's top-left corner. They are
 * extrapolated past the edges for points outside the picture, so they can
 * drive an edge arrow. `visible` is true only when the point is in front of
 * the camera and inside the picture. Far distance is not a reason to hide it,
 * so points beyond the far clipping plane still count as visible.
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

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);
    const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

    // With floating origin the matrices are camera-relative, so the point must
    // be expressed against the camera position as the frame origin.
    const worldOrigin = camera._useFloatingOrigin ? getCameraPosition(camera) : undefined;

    const projected = projectWorldToScreen(point, view, viewProjection, {
        viewport,
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
        worldOrigin,
    });

    // Deliberately ignore `clipped` and `offscreen`: they can reject points
    // beyond the far plane, which must count as visible. Only the in-front
    // test and the picture bounds decide visibility.
    const inFront = !projected.behindCamera;
    const inPicture =
        projected.cssX >= 0 &&
        projected.cssX <= cssWidth &&
        projected.cssY >= 0 &&
        projected.cssY <= cssHeight;

    return {
        x: projected.cssX,
        y: projected.cssY,
        visible: inFront && inPicture,
    };
}
