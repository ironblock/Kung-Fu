import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Matrix = ReturnType<typeof getViewMatrix>;

// A copy of the camera's matrices plus the canvas sizes they were made for.
// The library returns its own cache objects, which are overwritten in place,
// so the matrices must be copied to keep the state from a given mark.
interface Snapshot {
    view: Matrix;
    viewProjection: Matrix;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    const take = (): Snapshot => {
        const backingWidth = canvas.width;
        const backingHeight = canvas.height;
        // The camera renders to the whole canvas, so the aspect ratio is the backing one.
        const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
        const view = getViewMatrix(camera).slice() as Matrix;
        const viewProjection = getViewProjectionMatrix(camera, aspect).slice() as Matrix;
        return {
            view,
            viewProjection,
            backingWidth,
            backingHeight,
            cssWidth: canvas.clientWidth > 0 ? canvas.clientWidth : backingWidth,
            cssHeight: canvas.clientHeight > 0 ? canvas.clientHeight : backingHeight,
        };
    };

    const screenOf = (point: Vec, s: Snapshot): { x: number; y: number } => {
        const r = projectWorldToScreen(point, s.view, s.viewProjection, {
            viewport: { x: 0, y: 0, width: s.backingWidth, height: s.backingHeight },
            backingWidth: s.backingWidth,
            backingHeight: s.backingHeight,
            cssWidth: s.cssWidth,
            cssHeight: s.cssHeight,
        });
        return { x: r.cssX, y: r.cssY };
    };

    let marked: Snapshot = take();

    return {
        mark(): void {
            marked = take();
        },
        shift(point: Vec): { dx: number; dy: number } {
            const before = screenOf(point, marked);
            const after = screenOf(point, take());
            return { dx: after.x - before.x, dy: after.y - before.y };
        },
    };
}
