import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;
type ProjectOptions = Parameters<typeof projectWorldToScreen>[3];

interface ViewSnapshot {
    view: Mat;
    viewProjection: Mat;
    options: ProjectOptions;
}

// The library hands out its own cache buffers, which are rewritten in place on
// later calls, so every matrix is copied before it is kept.
function takeSnapshot(camera: Camera, canvas: HTMLCanvasElement): ViewSnapshot {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    // Fall back to the backing size when the canvas has no layout yet, so the
    // CSS size is always positive and projection does not throw.
    const cssWidth = canvas.clientWidth > 0 ? canvas.clientWidth : backingWidth;
    const cssHeight = canvas.clientHeight > 0 ? canvas.clientHeight : backingHeight;

    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const viewport = resolveCameraViewport(camera, backingWidth, backingHeight);

    // With a floating origin the view matrix has no translation, so absolute
    // points must be measured from the camera position at this moment.
    const floating = camera._useFloatingOrigin === true;
    const options: ProjectOptions = {
        viewport,
        backingWidth,
        backingHeight,
        cssWidth,
        cssHeight,
        ...(floating ? { worldOrigin: { ...getCameraPosition(camera) } } : {}),
    };

    return {
        view: structuredClone(getViewMatrix(camera)),
        viewProjection: structuredClone(getViewProjectionMatrix(camera, aspect)),
        options,
    };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let marked = takeSnapshot(camera, canvas);

    return {
        mark(): void {
            marked = takeSnapshot(camera, canvas);
        },
        shift(point: Vec): { dx: number; dy: number } {
            const now = takeSnapshot(camera, canvas);
            const before = projectWorldToScreen(point, marked.view, marked.viewProjection, marked.options);
            const after = projectWorldToScreen(point, now.view, now.viewProjection, now.options);
            return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
        },
    };
}
