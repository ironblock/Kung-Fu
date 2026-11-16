import {
    getCameraPosition,
    getEffectiveAspectRatio,
    getViewMatrix,
    getViewProjectionMatrix,
    projectWorldToScreen,
} from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";

type Vec = { x: number; y: number; z: number };
type Mat = ReturnType<typeof getViewMatrix>;

export interface ShiftTracker {
    mark(): void;
    shift(point: Vec): { dx: number; dy: number };
}

// Everything needed to project a world point to CSS pixels as the camera
// looked at one moment. The matrices are copies: the library overwrites its
// own cache objects in place on the next change.
interface Snapshot {
    view: Mat;
    viewProjection: Mat;
    origin: Vec | undefined;
    backingWidth: number;
    backingHeight: number;
    cssWidth: number;
    cssHeight: number;
}

function copyMatrix(m: Mat): Mat {
    return m.slice() as Mat;
}

function takeSnapshot(camera: Camera, canvas: HTMLCanvasElement): Snapshot {
    const backingWidth = canvas.width;
    const backingHeight = canvas.height;
    const aspect = getEffectiveAspectRatio(camera, backingWidth, backingHeight);

    const view = copyMatrix(getViewMatrix(camera));
    const viewProjection = copyMatrix(getViewProjectionMatrix(camera, aspect));

    // With a floating origin the view matrix has no translation, so the
    // projection needs the camera's world position as its origin.
    const origin = camera._useFloatingOrigin
        ? { ...getCameraPosition(camera) }
        : undefined;

    return {
        view,
        viewProjection,
        origin,
        backingWidth,
        backingHeight,
        cssWidth: canvas.clientWidth,
        cssHeight: canvas.clientHeight,
    };
}

function projectWithSnapshot(snap: Snapshot, point: Vec): { x: number; y: number } {
    const result = projectWorldToScreen(point, snap.view, snap.viewProjection, {
        // The camera renders to the whole canvas.
        viewport: { x: 0, y: 0, width: snap.backingWidth, height: snap.backingHeight },
        backingWidth: snap.backingWidth,
        backingHeight: snap.backingHeight,
        cssWidth: snap.cssWidth,
        cssHeight: snap.cssHeight,
        ...(snap.origin ? { worldOrigin: snap.origin } : {}),
    });
    return { x: result.cssX, y: result.cssY };
}

export function trackScreenShift(camera: Camera, canvas: HTMLCanvasElement): ShiftTracker {
    let marked = takeSnapshot(camera, canvas);

    return {
        mark(): void {
            marked = takeSnapshot(camera, canvas);
        },
        shift(point: Vec): { dx: number; dy: number } {
            const now = takeSnapshot(camera, canvas);
            const before = projectWithSnapshot(marked, point);
            const after = projectWithSnapshot(now, point);
            return { dx: after.x - before.x, dy: after.y - before.y };
        },
    };
}
