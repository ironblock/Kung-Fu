import {
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
export interface ShiftTracker { mark(): void; shift(point: Vec): { dx: number; dy: number } }

type Mat4 = ReturnType<typeof getViewMatrix>;

// The library hands out matrices that are cached and rewritten in place,
// so a mark must keep its own copy.
interface Snapshot {
    view: Mat4;
    viewProjection: Mat4;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
}

function copyMatrix(m: Mat4): Mat4 {
    return m.slice() as Mat4;
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let marked: Snapshot | null = null;

    // Captures the camera as it is now, including its field of view and
    // projection, together with the canvas size it is being drawn at.
    const take = (): Snapshot => {
        const backingWidth = canvas.width;
        const backingHeight = canvas.height;
        const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);
        // Read the view first and copy it before the next call can reuse the cache.
        const view = copyMatrix(getViewMatrix(camera));
        const viewProjection = copyMatrix(getViewProjectionMatrix(camera, aspect));
        return {
            view,
            viewProjection,
            backingWidth,
            backingHeight,
            cssWidth: canvas.clientWidth,
            cssHeight: canvas.clientHeight,
        };
    };

    const project = (s: Snapshot, point: Vec) =>
        projectWorldToScreen(point, s.view, s.viewProjection, {
            // The camera renders to the whole canvas.
            viewport: { x: 0, y: 0, width: s.backingWidth, height: s.backingHeight },
            backingWidth: s.backingWidth,
            backingHeight: s.backingHeight,
            cssWidth: s.cssWidth,
            cssHeight: s.cssHeight,
        });

    const mark = (): void => {
        marked = take();
    };

    mark();

    return {
        mark,
        shift(point: Vec): { dx: number; dy: number } {
            if (marked === null) {
                throw new Error("trackScreenShift: no mark");
            }
            const before = project(marked, point);
            const now = project(take(), point);
            // cssY grows downward, so a positive dy means the picture moved down.
            return { dx: now.cssX - before.cssX, dy: now.cssY - before.cssY };
        },
    };
}
