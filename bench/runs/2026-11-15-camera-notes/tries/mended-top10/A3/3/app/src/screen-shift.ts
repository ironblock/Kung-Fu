import type { Camera } from "@babylonjs/lite";
import {
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
type Mat = ReturnType<typeof getViewMatrix>;

export interface ShiftTracker {
    mark(): void;
    shift(point: Vec): { dx: number; dy: number };
}

interface ViewSnapshot {
    view: Mat;
    viewProjection: Mat;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
}

/**
 * Tracks how far the on-canvas picture of a world-space point has moved
 * since the last mark, in CSS pixels (dx right, dy down).
 *
 * The camera is assumed to render to the whole canvas, so the viewport is the
 * full backing store. Matrices are copied at capture time because the library
 * may return cached objects that are overwritten on the next change.
 */
export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    const capture = (): ViewSnapshot => {
        const backingWidth = canvas.width;
        const backingHeight = canvas.height;
        const aspect = backingWidth / backingHeight;
        return {
            view: getViewMatrix(camera).slice() as Mat,
            viewProjection: getViewProjectionMatrix(camera, aspect).slice() as Mat,
            backingWidth,
            backingHeight,
            cssWidth: canvas.clientWidth,
            cssHeight: canvas.clientHeight,
        };
    };

    const screenOf = (point: Vec, s: ViewSnapshot): { x: number; y: number } => {
        const r = projectWorldToScreen(point, s.view, s.viewProjection, {
            viewport: { x: 0, y: 0, width: s.backingWidth, height: s.backingHeight },
            backingWidth: s.backingWidth,
            backingHeight: s.backingHeight,
            cssWidth: s.cssWidth,
            cssHeight: s.cssHeight,
        });
        return { x: r.cssX, y: r.cssY };
    };

    let marked = capture();

    return {
        mark() {
            marked = capture();
        },
        shift(point) {
            const before = screenOf(point, marked);
            const after = screenOf(point, capture());
            return { dx: after.x - before.x, dy: after.y - before.y };
        },
    };
}
