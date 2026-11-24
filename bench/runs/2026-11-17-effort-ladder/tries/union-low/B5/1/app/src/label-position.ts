import type { Camera } from "@babylonjs/lite";
import {
    getViewMatrix,
    getViewProjectionMatrix,
    getEffectiveAspectRatio,
    resolveCameraViewport,
    projectWorldToScreen,
    getCameraPosition,
} from "@babylonjs/lite";

export function labelPosition(
    camera: Camera,
    canvas: HTMLCanvasElement,
    point: { x: number; y: number; z: number }
): { x: number; y: number; visible: boolean } {
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera);
    const viewProjection = getViewProjectionMatrix(camera, aspect);
    const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

    const worldOrigin = camera._useFloatingOrigin ? getCameraPosition(camera) : undefined;

    const result = projectWorldToScreen(point, view, viewProjection, {
        viewport,
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
        worldOrigin,
    });

    return {
        x: result.cssX,
        y: result.cssY,
        visible: !result.behindCamera && !result.offscreen,
    };
}
