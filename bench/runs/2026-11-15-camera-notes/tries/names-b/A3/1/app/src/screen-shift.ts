import type { Camera } from "@babylonjs/lite";
import {
    getViewMatrix,
    getViewProjectionMatrix,
    getEffectiveAspectRatio,
    resolveCameraViewport,
    projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Matrix = ReturnType<typeof getViewMatrix>;

/**
 * Tracks how far the screen picture of a world-space point has moved between
 * the last `mark()` and the camera's current state (position, orientation,
 * zoom and field of view). Result is in CSS pixels; dx right, dy down.
 */
export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    // Snapshots taken at mark time. Copied, because the library may hand back
    // internal cache objects that get overwritten on the next change.
    let markedView: Matrix | undefined;
    let markedViewProj: Matrix | undefined;

    const currentPixelOptions = () => {
        const backingWidth = canvas.width;
        const backingHeight = canvas.height;
        const dpr = window.devicePixelRatio || 1;
        return {
            viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
            backingWidth,
            backingHeight,
            cssWidth: canvas.clientWidth || backingWidth / dpr,
            cssHeight: canvas.clientHeight || backingHeight / dpr,
        };
    };

    const mark = (): void => {
        const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);
        markedView = structuredClone(getViewMatrix(camera));
        markedViewProj = structuredClone(getViewProjectionMatrix(camera, aspect));
    };

    const shift = (point: Vec): { dx: number; dy: number } => {
        if (!markedView || !markedViewProj) {
            throw new Error("screen-shift: mark() has not been called");
        }
        const options = currentPixelOptions();

        const aspect = getEffectiveAspectRatio(camera, canvas.width, canvas.height);
        const nowView = getViewMatrix(camera);
        const nowViewProj = getViewProjectionMatrix(camera, aspect);

        const before = projectWorldToScreen(point, markedView, markedViewProj, options);
        const after = projectWorldToScreen(point, nowView, nowViewProj, options);

        return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
    };

    mark();
    return { mark, shift };
}
