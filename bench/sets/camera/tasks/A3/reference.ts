import { getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";
import type { Camera, Mat4 } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker {
    mark(): void;
    shift(point: Vec): { dx: number; dy: number };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    const options = () => ({
        viewport: { x: 0, y: 0, width: canvas.width, height: canvas.height },
        backingWidth: canvas.width,
        backingHeight: canvas.height,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
    });
    // The library hands back the camera's own cache, rewritten in place when the camera changes: keep copies.
    let view = Float64Array.from(getViewMatrix(camera) as unknown as ArrayLike<number>);
    let viewProjection = Float64Array.from(getViewProjectionMatrix(camera, canvas.width / canvas.height) as unknown as ArrayLike<number>);
    const mark = (): void => {
        view = Float64Array.from(getViewMatrix(camera) as unknown as ArrayLike<number>);
        viewProjection = Float64Array.from(getViewProjectionMatrix(camera, canvas.width / canvas.height) as unknown as ArrayLike<number>);
    };
    return {
        mark,
        shift(point) {
            const o = options();
            const before = projectWorldToScreen(point, view as unknown as Mat4, viewProjection as unknown as Mat4, o);
            const after = projectWorldToScreen(point, getViewMatrix(camera), getViewProjectionMatrix(camera, canvas.width / canvas.height), o);
            return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
        },
    };
}
