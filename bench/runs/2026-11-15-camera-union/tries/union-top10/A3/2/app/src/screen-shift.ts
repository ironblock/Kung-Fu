import type { Camera } from "@babylonjs/lite";
import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
    resolveCameraViewport,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat = ReturnType<typeof getViewMatrix>;
type ScreenOptions = Parameters<typeof projectWorldToScreen>[3];

// Everything needed to project a point the way the canvas showed it at one moment.
// The camera hands out cached matrices that are overwritten in place, so the
// matrices are copied here; the stored frame does not change when the camera does.
interface Frame {
    view: Mat;
    viewProjection: Mat;
    options: ScreenOptions;
}

function captureFrame(camera: Camera, canvas: HTMLCanvasElement): Frame {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
    const view = getViewMatrix(camera).slice() as Mat;
    const viewProjection = getViewProjectionMatrix(camera, aspect).slice() as Mat;
    return {
        view,
        viewProjection,
        options: {
            viewport: resolveCameraViewport(camera, backingWidth, backingHeight),
            backingWidth,
            backingHeight,
            cssWidth: canvas.clientWidth,
            cssHeight: canvas.clientHeight,
        },
    };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let marked = captureFrame(camera, canvas);

    return {
        mark(): void {
            marked = captureFrame(camera, canvas);
        },
        shift(point: Vec): { dx: number; dy: number } {
            const now = captureFrame(camera, canvas);
            const before = projectWorldToScreen(point, marked.view, marked.viewProjection, marked.options);
            const after = projectWorldToScreen(point, now.view, now.viewProjection, now.options);
            return { dx: after.cssX - before.cssX, dy: after.cssY - before.cssY };
        },
    };
}
