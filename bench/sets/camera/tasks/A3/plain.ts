import { getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";
import type { Camera, Mat4 } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker {
    mark(): void;
    shift(point: Vec): { dx: number; dy: number };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    const aspect = () => canvas.width / canvas.height;
    const options = () => ({
        viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
        backingWidth: canvas.width,
        backingHeight: canvas.height,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
    });
    let view: Mat4 = getViewMatrix(camera);
    let viewProjection: Mat4 = getViewProjectionMatrix(camera, aspect());
    return {
        mark() {
            view = getViewMatrix(camera);
            viewProjection = getViewProjectionMatrix(camera, aspect());
        },
        shift(point) {
            const before = projectWorldToScreen(point, view, viewProjection, options());
            const after = projectWorldToScreen(point, getViewMatrix(camera), getViewProjectionMatrix(camera, aspect()), options());
            return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
        },
    };
}
